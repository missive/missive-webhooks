const Integration = require('../integration')

class GitHub extends Integration {
  process(payload, req) {
    var type = req.get('X-GitHub-Event')

    if (this[type]) {
      return this[type](payload)
    }
  }

  // Supported event types
  commit_comment (payload) {
    if (['created'].indexOf(payload.action) == -1) { return }
    var { comment, repository, sender } = payload
    var html

    html  = `New ${this.link(comment.html_url, 'comment')} by ${this.userLink(sender)}`
    html += this.markdownToHTML(comment.body)

    return {
      referenceId: `${repository.id}/${comment.commit_id}`,
      subject: `[${repository.full_name}] ${this.shortCommit(comment.commit_id)}`,
      html: html,
    }
  }

  create (payload) {
    if (['tag'].indexOf(payload.ref_type) == -1) { return }
    var { ref, ref_type, repository, sender } = payload
    var html

    html = `New ${ref_type} ${this.branchLink(ref, repository)} was pushed by ${this.userLink(sender)}`

    return {
      referenceId: `${repository.id}/${ref}`,
      subject: `[${repository.full_name}] ${ref}`,
      html: html,
    }
  }

  delete (payload) {
    if (['tag'].indexOf(payload.ref_type) == -1) { return }
    var { ref, ref_type, repository, sender } = payload
    var html

    html = `The ${ref_type} “${ref}” was deleted by ${this.userLink(sender)}`

    return {
      referenceId: `${repository.id}/${ref}`,
      subject: `[${repository.full_name}] ${ref}`,
      html: html,
    }
  }

  deployment (payload) { /* TODO */ }
  deployment_status (payload) { /* TODO */ }

  fork (payload) {
    var { forkee, repository, sender } = payload
    var html

    html = `${repository.name} was forked by ${this.userLink(sender)} at ${this.link(forkee.html_url, forkee.full_name)}`

    return {
      referenceId: repository.id,
      subject: `[${repository.full_name}]`,
      html: html,
    }
  }

  gollum (payload) { /* TODO */ }

  issue_comment(payload) {
    if (['created'].indexOf(payload.action) == -1) { return }
    var { issue, comment, repository, sender } = payload
    var html

    html  = `New ${this.link(comment.html_url, 'comment')} by ${this.userLink(sender)}`
    html += this.markdownToHTML(comment.body)

    return {
      referenceId: this.referenceIdForIssue(issue, repository),
      subject: this.subjectForIssue(issue, repository),
      html: html,
    }
  }

  issues(payload) {
    if (['opened', 'closed', 'reopened'].indexOf(payload.action) == -1) { return }
    var { issue, repository, sender } = payload
    var html

    html = `${this.link(issue.html_url, 'Issue')} ${payload.action} by ${this.userLink(sender)}`
    if (payload.action == 'opened') {
      html += this.markdownToHTML(issue.body)
    }

    return {
      referenceId: this.referenceIdForIssue(issue, repository),
      subject: this.subjectForIssue(issue, repository),
      html: html,
    }
  }

  member (payload) {
    if (['added'].indexOf(payload.action) == -1) { return }
    var { member, repository, sender } = payload
    var html

    html = `${this.userLink(sender)} added ${this.userLink(member)} as a collaborator`

    return {
      referenceId: repository.id,
      subject: `[${repository.full_name}]`,
      html: html,
    }
  }

  page_build (payload) {
    if (['built', 'errored'].indexOf(payload.build.status) == -1) { return }
    var { build, repository } = payload
    var html

    switch (build.status) {
      case 'built':
        html = `Page was successfully built: ${this.pageLink(repository)}`
        break

      case 'errored':
        html = `There was an error building the page: ${this.pageLink(repository)}`
        break
    }

    return {
      referenceId: repository.id,
      subject: `[${repository.full_name}]`,
      html: html,
    }
  }

  public (payload) {
    var { repository, sender } = payload
    var html

    html = `${this.userLink(sender)} open sourced ${this.link(repository.html_url, repository.name)}`

    return {
      referenceId: repository.id,
      subject: `[${repository.full_name}]`,
      html: html,
    }
  }

  pull_request(payload) {
    if (['opened', 'closed', 'reopened'].indexOf(payload.action) == -1) { return }
    var { pull_request, repository, sender } = payload
    var html, action

    action = payload.action
    if (action == 'closed' && pull_request.merged) {
      action = 'merged'
    }

    html = `${this.link(pull_request.html_url, 'Pull request')} ${action} by ${this.userLink(sender)}`
    if (payload.action == 'opened') {
      html += this.markdownToHTML(pull_request.body)
    }

    return {
      referenceId: this.referenceIdForIssue(pull_request, repository),
      subject: this.subjectForIssue(pull_request, repository),
      html: html,
    }
  }

  pull_request_review_comment(payload) {
    if (['created'].indexOf(payload.action) == -1) { return }
    var { pull_request, comment, repository, sender } = payload
    var html

    html  = `New ${this.link(comment.html_url, 'comment')} by ${this.userLink(sender)}`
    html += this.markdownToHTML(comment.body)

    return {
      referenceId: this.referenceIdForIssue(pull_request, repository),
      subject: this.subjectForIssue(pull_request, repository),
      html: html,
    }
  }

  push (payload) {
    var { ref, created, deleted, forced, head_commit, compare, commits, repository, sender } = payload
    var html, branch, size, includeCommits

    branch = ref.split('/')
    branch = branch[branch.length - 1]

    size = commits.length

    if (created) {
      html = `${this.userLink(sender)} created new branch ${this.branchLink(branch, repository)}`
      if (size > 0) {
        html += ' and'
        includeCommits = true
      }
    } else if (deleted) {
      html = `${this.userLink(sender)} deleted “${branch}”`
    } else if (forced) {
      html = `${this.userLink(sender)} force-pushed ${this.branchLink(branch, repository)} to ${this.link(head_commit.url, this.shortCommit(head_commit.id))}`
    } else {
      html = `${this.userLink(sender)}`
      includeCommits = true
    }

    if (includeCommits && size > 0) {
      html += ` pushed ${this.link(compare, `${size} new commit${size > 1 ? 's' : ''}`)}`
      commits.forEach((commit) => {
        var msg = commit.message.split('\n')[0]
        html += `<div>${this.link(commit.url, this.shortCommit(commit.id))} ${msg} - ${commit.author.name}</div>`
      })
    }

    return {
      referenceId: `${repository.id}/${branch}`,
      subject: `[${repository.full_name}] ${branch}`,
      html: html,
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
