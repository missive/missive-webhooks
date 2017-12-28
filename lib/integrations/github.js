const Integration = require('../integration')

class GitHub extends Integration {
  process(payload, req) {
    var type = req.get('X-GitHub-Event')

    if (this[type]) {
      return this[type](payload)
    }
  }

  // Supported event types
  ping (payload) {
    return { referenceId: 'pong' }
  }

  commit_comment (payload) {
    if (['created'].indexOf(payload.action) == -1) return

    var { comment, repository, sender } = payload
    var pretext = this.sanitize(() => `New ${this.link(comment.html_url, 'comment')} by ${this.userLink(sender)}`)

    return {
      referenceId: `${repository.id}/${comment.commit_id}`,
      subject: `[${repository.full_name}] ${this.shortCommit(comment.commit_id)}`,
      notification: pretext.sanitized,
      attachment: {
        pretext: pretext.toString(),
        markdown: comment.body,
      }
    }
  }

  create (payload) {
    if (['tag'].indexOf(payload.ref_type) == -1) return

    var { ref, ref_type, repository, sender } = payload
    var text = this.sanitize(() => `New ${ref_type} ${this.branchLink(ref, repository)} was pushed by ${this.userLink(sender)}`)

    return {
      referenceId: `${repository.id}/${ref}`,
      subject: `[${repository.full_name}] ${ref}`,
      notification: text.sanitized,
      attachment: { text: text.toString() },
    }
  }

  delete (payload) {
    if (['tag'].indexOf(payload.ref_type) == -1) return

    var { ref, ref_type, repository, sender } = payload
    var text = this.sanitize(() => `The ${ref_type} “${ref}” was deleted by ${this.userLink(sender)}`)

    return {
      referenceId: `${repository.id}/${ref}`,
      subject: `[${repository.full_name}] ${ref}`,
      notification: text.sanitized,
      attachment: { text: text.toString() },
    }
  }

  deployment (payload) { /* TODO */ }
  deployment_status (payload) { /* TODO */ }

  fork (payload) {
    var { forkee, repository, sender } = payload
    var text = this.sanitize(() => `${repository.name} was forked by ${this.userLink(sender)} at ${this.link(forkee.html_url, forkee.full_name)}`)

    return {
      referenceId: repository.id,
      subject: `[${repository.full_name}]`,
      notification: text.sanitized,
      attachment: { text: text.toString() },
    }
  }

  gollum (payload) { /* TODO */ }

  issue_comment(payload) {
    if (['created'].indexOf(payload.action) == -1) return

    var { issue, comment, repository, sender } = payload
    var pretext = this.sanitize(() => `New ${this.link(comment.html_url, 'comment')} by ${this.userLink(sender)}`)

    return {
      referenceId: this.referenceIdForIssue(issue, repository),
      subject: this.subjectForIssue(issue, repository),
      notification: pretext.sanitized,
      attachment: {
        pretext: pretext.toString(),
        markdown: comment.body,
      }
    }
  }

  issues(payload) {
    if (['opened', 'closed', 'reopened'].indexOf(payload.action) == -1) return
    var { issue, repository, sender } = payload

    var title, title_link, text, markdown, pretext = this.sanitize(() => `${this.link(issue.html_url, 'Issue')} ${payload.action} by ${this.userLink(sender)}`)
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

    return {
      referenceId: this.referenceIdForIssue(issue, repository),
      subject: this.subjectForIssue(issue, repository),
      notification: notification,
      attachment: { title, title_link, pretext, text, markdown },
    }
  }

  member (payload) {
    if (['added'].indexOf(payload.action) == -1) return

    var { member, repository, sender } = payload
    var text = this.sanitize(() => `${this.userLink(sender)} added ${this.userLink(member)} as a collaborator`)

    return {
      referenceId: repository.id,
      subject: `[${repository.full_name}]`,
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
      referenceId: repository.id,
      subject: `[${repository.full_name}]`,
      notification: text.sanitized,
      attachment: { text: text.toString() },
    }
  }

  public (payload) {
    var { repository, sender } = payload
    var text = this.sanitize(() => `${this.userLink(sender)} open sourced ${this.link(repository.html_url, repository.name)}`)

    return {
      referenceId: repository.id,
      subject: `[${repository.full_name}]`,
      attachment: { text: text.toString() },
    }
  }

  pull_request(payload) {
    if (['opened', 'closed', 'reopened'].indexOf(payload.action) == -1) return

    var { action, pull_request, repository, sender } = payload
    var title, title_link, text, pretext, markdown, notification

    if (action == 'closed' && pull_request.merged) {
      action = 'merged'
    }

    pretext = this.sanitize(() => `${this.link(pull_request.html_url, 'Pull request')} ${action} by ${this.userLink(sender)}`)
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

    return {
      referenceId: this.referenceIdForIssue(pull_request, repository),
      subject: this.subjectForIssue(pull_request, repository),
      notification: notification,
      attachment: { title, title_link, pretext, text, markdown },
    }
  }

  pull_request_review_comment(payload) {
    if (['created'].indexOf(payload.action) == -1) return

    var { pull_request, comment, repository, sender } = payload
    var pretext = this.sanitize(() => `New ${this.link(comment.html_url, 'comment')} by ${this.userLink(sender)}`)

    return {
      referenceId: this.referenceIdForIssue(pull_request, repository),
      subject: this.subjectForIssue(pull_request, repository),
      notification: pretext.sanitized,
      attachment: {
        pretext: pretext.toString(),
        markdown: comment.body,
      }
    }
  }

  push (payload) {
    var { ref, created, deleted, forced, head_commit, compare, commits, repository, sender } = payload
    var text = [], pretext, notification, splits, branch, type, size, includeCommits

    splits = ref.split('/')
    type = splits[1]

    if (['heads'].indexOf(type) == -1) return

    branch = splits[splits.length - 1]
    size = commits.length

    if (created) {
      pretext = this.sanitize(() => `${this.userLink(sender)} created new branch ${this.branchLink(branch, repository)}`)
      if (size > 0) {
        pretext = pretext.add(() => ' and')
        includeCommits = true
      }
    } else if (deleted) {
      pretext = this.sanitize(() => `${this.userLink(sender)} deleted “${branch}”`)
    } else if (forced) {
      pretext = this.sanitize(() => `${this.userLink(sender)} force-pushed ${this.branchLink(branch, repository)} to ${this.link(head_commit.url, this.shortCommit(head_commit.id))}`)
    } else {
      pretext = this.sanitize(() => `${this.userLink(sender)}`)
      includeCommits = true
    }

    if (includeCommits && size > 0) {
      pretext = pretext.add(() => ` pushed ${this.link(compare, `${size} new commit${size > 1 ? 's' : ''}`)}`)
      commits.forEach((commit) => {
        var msg = commit.message.split('\n')[0]
        text.push(`${this.codeLink(commit.url, this.shortCommit(commit.id))} ${msg} - ${commit.author.name}`)
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
      referenceId: `${repository.id}/${branch}`,
      subject: `[${repository.full_name}] ${branch}`,
      notification: notification,
      attachment: { pretext, text },
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
    return this.link(`${repository.html_url}/tree/${branch}`, branch)
  }

  shortCommit(commitId) {
    return commitId.substr(0, 7)
  }

  referenceIdForIssue(issue, repository) {
    return `${repository.id}/${issue.number}`
  }

  subjectForIssue(issue, repository) {
    return `[${repository.full_name}] #${issue.number} ${issue.title}`
  }
}

module.exports = GitHub
