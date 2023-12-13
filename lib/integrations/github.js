const Integration = require('../integration')

const COLORS = {
  commit: '#0093ce',
  commitComment: '#00acf0',
  issue: '#de5c00',
  issueComment: '#ff7d22',
  pr: '#009e61',
  prComment: '#00c76e',
  rejected: '#c6474e',
  deploy: '#430098',
}

class GitHub extends Integration {
  get id() { return 'github' }

  process(payload, req) {
    let type = req.get('X-GitHub-Event')
    let contentType = req.get('Content-Type')

    if (contentType == 'application/x-www-form-urlencoded') {
      if (payload && payload.payload) {
        payload = JSON.parse(`${payload.payload}`)
      }
    }

    if (this[type]) {
      return this[type](payload)
    }
  }

  // Supported event types
  ping (payload) {
    return { references: ['pong'] }
  }

  commit_comment (payload) {
    if (['created'].indexOf(payload.action) == -1) return

    var { comment, repository, sender } = payload
    var pretext = this.sanitize(() => `New comment by ${sender.login} on commit ${this.link(comment.html_url, this.shortCommit(comment.commit_id))}`)

    if (comment.line) {
      pretext = pretext.add(() => ` on line ${comment.line}`)
    }

    return {
      references: this.referencesForRepository(repository),
      subject: this.subjectForRepository(repository),
      notification: pretext.sanitized,
      attachment: {
        pretext: pretext.toString(),
        markdown: comment.body,
        color: COLORS.commitComment,
      }
    }
  }

  create (payload) {
    if (['tag'].indexOf(payload.ref_type) == -1) return

    var { ref, ref_type, repository, sender } = payload
    var text = this.sanitize(() => `New ${ref_type} ${this.branchLink(ref, repository)} was pushed by ${sender.login}`)

    return {
      references: this.referencesForRepository(repository),
      subject: this.subjectForRepository(repository),
      notification: text.sanitized,
      attachment: {
        text: text.toString(),
        color: COLORS.commit,
      }
    }
  }

  delete (payload) {
    if (['tag'].indexOf(payload.ref_type) == -1) return

    var { ref, ref_type, repository, sender } = payload
    var text = this.sanitize(() => `The ${ref_type} “${ref}” was deleted by ${sender.login}`)

    return {
      references: this.referencesForRepository(repository),
      subject: this.subjectForRepository(repository),
      notification: text.sanitized,
      attachment: { text: text.toString() },
    }
  }

  deployment (payload) { /* TODO */ }

  deployment_status (payload) {
    const { deployment_status, deployment, sender, repository } = payload
    if (['success', 'failure'].indexOf(payload.deployment_status.state) == -1) return

    var text, color

    if (deployment_status.state == 'success') {
      text = this.sanitize(() => `${sender.login} ${this.link(deployment_status.target_url, 'deployed')} ${this.commitLink(deployment.sha, repository)} to ${this.link(deployment.payload.web_url, deployment.environment)}`)
      color = COLORS.deploy
    } else if (deployment_status.state == 'failure') {
      text = this.sanitize(() => `${sender.login} ${this.link(deployment_status.target_url, 'failed to deploy')} ${this.commitLink(deployment.sha, repository)} to ${this.link(deployment.payload.web_url, deployment.environment)}`)
      color = COLORS.rejected
    }

    var notification = text.sanitized
    text = text.toString()

    return {
      references: this.referencesForRepository(repository),
      subject: this.subjectForRepository(repository),
      notification: notification,
      attachment: { text, color },
    }
  }

  fork (payload) { /* TODO */ }
  gollum (payload) { /* TODO */ }

  issue_comment(payload) {
    if (['created'].indexOf(payload.action) == -1) return

    var { issue, comment, repository, sender } = payload
    var pretext = this.sanitize(() => `New ${this.link(comment.html_url, 'comment')} by ${sender.login}`)
    var isPR = /\/pull\/\d+$/.test(issue.html_url)

    return {
      references: this.referencesForIssue(issue, repository),
      subject: this.subjectForIssue(issue, repository),
      notification: pretext.sanitized,
      attachment: {
        pretext: pretext.toString(),
        markdown: comment.body,
        color: isPR ? COLORS.prComment : COLORS.issueComment,
      }
    }
  }

  issues(payload) {
    if (['opened', 'closed', 'reopened'].indexOf(payload.action) == -1) return
    var { issue, repository, sender } = payload

    var title, title_link, text, markdown, color, pretext = this.sanitize(() => `${this.link(issue.html_url, 'Issue')} ${payload.action} by ${sender.login}`)
    var notification = pretext.sanitized

    if (payload.action == 'opened') {
      title = issue.title
      title_link = issue.html_url
      markdown = issue.body
      pretext = pretext.toString()
    } else {
      text = pretext.toString()
      pretext = undefined
    }

    if (payload.action != 'closed') {
      color = COLORS.issue
    }

    return {
      references: this.referencesForIssue(issue, repository),
      subject: this.subjectForIssue(issue, repository),
      notification: notification,
      attachment: { title, title_link, pretext, text, markdown, color },
    }
  }

  member (payload) {
    if (['added'].indexOf(payload.action) == -1) return

    var { member, repository, sender } = payload
    var text = this.sanitize(() => `${sender.login} added ${this.userLink(member)} as a collaborator`)

    return {
      references: this.referencesForRepository(repository),
      subject: this.subjectForRepository(repository),
      attachment: { text: text.toString() },
    }
  }

  page_build (payload) {
    if (['built', 'errored'].indexOf(payload.build.status) == -1) return

    var { build, repository } = payload
    var text

    switch (build.status) {
      case 'built':
        text = this.sanitize(() => `Page was successfully built: ${this.pageLink(repository)}`)
        break

      case 'errored':
        text = this.sanitize(() => `There was an error building the page: ${this.pageLink(repository)}`)
        break
    }

    return {
      references: this.referencesForRepository(repository),
      subject: this.subjectForRepository(repository),
      notification: text.sanitized,
      attachment: { text: text.toString() },
    }
  }

  public (payload) {
    var { repository, sender } = payload
    var text = this.sanitize(() => `${sender.login} open sourced ${this.link(repository.html_url, repository.name)}`)

    return {
      references: this.referencesForRepository(repository),
      subject: this.subjectForRepository(repository),
      attachment: { text: text.toString() },
    }
  }

  pull_request(payload) {
    if (['opened', 'closed', 'reopened', 'assigned', 'unassigned', 'review_requested', 'review_request_removed'].indexOf(payload.action) == -1) return

    var { action, pull_request, repository, sender } = payload
    var title, title_link, text, pretext, markdown, color, notification

    if (action == 'closed' && pull_request.merged) {
      action = 'merged'
    }

    if (action == 'assigned' || action == 'unassigned') {
      var { assignee } = payload
      var fromTo = action == 'assigned' ? 'to' : 'from'

      pretext = this.sanitize(() => `${sender.login} ${action} ${assignee.login} ${fromTo} ${this.pullRequestLink(pull_request, repository)}`)
    } else if (action == 'review_requested' || action == 'review_request_removed') {
      var { requested_reviewer } = payload
      var theAction = ''

      if (action == 'review_requested') {
        theAction = 'requested a review'
      } else {
        theAction = 'removed the review request'
      }

      pretext = this.sanitize(() => `${sender.login} ${theAction} from ${requested_reviewer.login} on ${this.pullRequestLink(pull_request, repository)}`)
    } else {
      pretext = this.sanitize(() => `${this.pullRequestLink(pull_request, repository)} ${action} by ${sender.login}`)
    }

    notification = pretext.sanitized

    if (action == 'opened') {
      title = pull_request.title
      title_link = pull_request.html_url
      markdown = pull_request.body
      pretext = pretext.toString()
    } else {
      text = pretext.toString()
      pretext = undefined
    }

    if (action != 'closed') {
      color = COLORS.pr
    }

    return {
      references: this.referencesForIssue(pull_request, repository),
      subject: this.subjectForIssue(pull_request, repository),
      update_existing_conversation_subject: true,
      notification: notification,
      attachment: { title, title_link, pretext, text, markdown, color },
    }
  }

  pull_request_review(payload) {
    if (['submitted'].indexOf(payload.action) == -1) return

    var { pull_request, review, repository, sender } = payload
    var pretext, color = COLORS.prComment

    if (review.state == 'changes_requested') {
      pretext = this.sanitize(() => `New changes requested by ${sender.login} in ${this.link(review.html_url, 'review')}`)
      color = COLORS.rejected
    } else if (review.state == 'approved') {
      pretext = this.sanitize(() => `New changes approved by ${sender.login} in ${this.link(review.html_url, 'review')}`)
    } else {
      if (!review.body) return
      pretext = this.sanitize(() => `New ${this.link(review.html_url, 'review')} by ${sender.login}`)
    }

    return {
      references: this.referencesForIssue(pull_request, repository),
      subject: this.subjectForIssue(pull_request, repository),
      notification: pretext.sanitized,
      attachment: {
        pretext: pretext.toString(),
        markdown: review.body,
        color: color,
      }
    }
  }

  pull_request_review_comment(payload) {
    if (['created'].indexOf(payload.action) == -1) return

    var { pull_request, comment, repository, sender } = payload
    var pretext = this.sanitize(() => `New ${this.link(comment.html_url, 'comment')} by ${sender.login}`)

    return {
      references: this.referencesForIssue(pull_request, repository),
      subject: this.subjectForIssue(pull_request, repository),
      notification: pretext.sanitized,
      attachment: {
        pretext: pretext.toString(),
        markdown: comment.body,
        color: COLORS.prComment,
      }
    }
  }

  push (payload) {
    var { ref, created, deleted, forced, head_commit, compare, commits, repository, sender } = payload
    var text = [], pretext, notification, splits, branch, type, size, includeCommits, color

    splits = ref.split('/')
    type = splits[1]

    if (['heads'].indexOf(type) == -1) return

    branch = splits[splits.length - 1]
    size = commits.length
    color = COLORS.commit

    if (created) {
      pretext = this.sanitize(() => `${sender.login} created new branch ${this.branchLink(branch, repository)}`)
      if (size > 0) {
        pretext = pretext.add(() => ' and')
        includeCommits = true
      }
    } else if (deleted) {
      pretext = this.sanitize(() => `${sender.login} deleted “${branch}”`)
      color = undefined
    } else if (forced) {
      pretext = this.sanitize(() => `${sender.login} force-pushed ${this.branchLink(branch, repository)} to ${this.link(this.commitUrl(head_commit), this.shortCommit(head_commit.id))}`)
    } else {
      pretext = this.sanitize(() => `${sender.login}`)
      includeCommits = true
    }

    const referencedConversations = []

    if (includeCommits && size > 0) {
      pretext = pretext.add(() => ` pushed ${this.link(compare, `${size} new commit${size > 1 ? 's' : ''}`)} to ${this.branchLink(branch, repository)}`)
      commits.forEach((commit) => {
        const msg = commit.message.split('\n')[0]
        let line = `${this.codeLink(this.commitUrl(commit), this.shortCommit(commit.id))} ${msg}`

        if (commit.author.username && commit.author.username.toLowerCase() != sender.login.toLowerCase()) {
          line += ` - ${commit.author.username}`
        }

        // Detect if commit contains conversation links
        const protocols = ['https', 'missive']
        const domain = 'mail.missiveapp.com'
        const mailboxType = '(?:[^\/]+)'
        const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
        const regex = new RegExp(`(?:${protocols.join('|')}):\/\/${domain}\/#${mailboxType}.*\/conversations\/(${uuid})`, 'gi')

        let match
        while (match = regex.exec(commit.message)) {
          const conversation = match[1]
          referencedConversations.push({ conversation, commit })
        }

        text.push(line)
      })

      text = text.join('\n')
    }

    notification = pretext.sanitized
    pretext = pretext.toString()

    if (!text.length) {
      text = pretext
      pretext = undefined
    }

    return {
      references: [`${repository.id}/${branch}`],
      subject: this.subjectForRepository(null, repository, branch),
      notification: notification,
      attachment: { pretext, text, color },
      callback: (conversationId, { createPost }) => {
        if (!referencedConversations.length) return
        for (const { conversation, commit } of referencedConversations) {
          if (conversationId == conversation) continue

          let text = this.sanitize(() => `${commit.author.username} referenced this conversation in ${this.codeLink(this.commitUrl(commit), this.shortCommit(commit.id))}`)

          const notification = text.sanitized
          const color = COLORS.commit
          text = text.toString()

          createPost({
            conversation: conversation,
            notification: notification,
            attachment: { text, color },
          })
        }
      },
    }
  }

  release (payload) { /* TODO */ }
  repository (payload) { /* TODO */ }
  status (payload) { /* TODO */ }
  team_add (payload) { /* TODO */ }
  watch (payload) { /* TODO */ }

  // Helpers
  userLink(user) {
    return this.link(user.html_url, user.login)
  }

  pageLink(repository) {
    return this.link(`https://${repository.owner.login}.github.io/${repository.name}`)
  }

  branchLink(branch, repository) {
    return this.link(`${repository.html_url}/tree/${branch}`, `${repository.name}/${branch}`)
  }

  pullRequestLink(pull_request, repository) {
    return this.link(`${pull_request.html_url}`, `${repository.name}/${pull_request.number}`)
  }

  commitLink(commitId, repository) {
    return this.codeLink(`${repository.html_url}/commit/${commitId}`, this.shortCommit(commitId))
  }

  shortCommit(commitId) {
    return commitId.substr(0, 7)
  }

  commitUrl(commit) {
    return `${commit.url}?w=1`
  }

  referencesForRepository(repository, ref = 'master') {
    return [`${repository.id}/${ref}`]
  }

  referencesForIssue(issue, repository) {
    let references = [`${repository.id}/${issue.number}`]

    // When `issue` is a pull-request from the same repo,
    // add branch reference so that everything related to that PR
    // is added to the branch conversation
    if (issue.head && issue.head.repo.id == repository.id) {
      let branch = issue.head.ref
      references.unshift(`${repository.id}/${branch}`)
    }

    return references
  }

  subjectForIssue(issue, repository) {
    let { number, title, head } = issue
    let subject = `#${number} ${title}`
    let branch

    // When `issue` is a pull-request from the same repo,
    // add branch to the subject
    if (head && head.repo.id == repository.id) {
      branch = head.ref
    }

    return this.subjectForRepository(subject, repository, branch)
  }

  subjectForRepository(subject, repository, branch) {
    if (!repository) {
      repository = subject
      subject = null
    }

    let repoName = `[${repository.name}${branch ? `:${branch}` : ''}]`

    if (!subject) {
      return repoName
    } else {
      return `${subject} ${repoName}`
    }
  }
}

module.exports = GitHub
