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
    if (['created'].indexOf(payload.action) == -1) return

    var { comment, repository, sender } = payload
    var message = []

    message.push(`New ${this.link(comment.html_url, 'comment')} by ${this.userLink(sender)}`)
    message.push(comment.body)

    return {
      referenceId: `${repository.id}/${comment.commit_id}`,
      subject: `[${repository.full_name}] ${this.shortCommit(comment.commit_id)}`,
      message: message.join('\n'),
    }
  }

  create (payload) {
    if (['tag'].indexOf(payload.ref_type) == -1) return
    var { ref, ref_type, repository, sender } = payload
    var message = []

    message.push(`New ${ref_type} ${this.branchLink(ref, repository)} was pushed by ${this.userLink(sender)}`)

    return {
      referenceId: `${repository.id}/${ref}`,
      subject: `[${repository.full_name}] ${ref}`,
      message: message.join('\n'),
    }
  }

  delete (payload) {
    if (['tag'].indexOf(payload.ref_type) == -1) return
    var { ref, ref_type, repository, sender } = payload
    var message = []

    message.push(`The ${ref_type} “${ref}” was deleted by ${this.userLink(sender)}`)

    return {
      referenceId: `${repository.id}/${ref}`,
      subject: `[${repository.full_name}] ${ref}`,
      message: message.join('\n'),
    }
  }

  deployment (payload) { /* TODO */ }
  deployment_status (payload) { /* TODO */ }

  fork (payload) {
    var { forkee, repository, sender } = payload
    var message = []

    message.push(`${repository.name} was forked by ${this.userLink(sender)} at ${this.link(forkee.html_url, forkee.full_name)}`)

    return {
      referenceId: repository.id,
      subject: `[${repository.full_name}]`,
      message: message.join('\n'),
    }
  }

  gollum (payload) { /* TODO */ }

  issue_comment(payload) {
    if (['created'].indexOf(payload.action) == -1) return

    var { issue, comment, repository, sender } = payload
    var message = []

    message.push(`New ${this.link(comment.html_url, 'comment')} by ${this.userLink(sender)}`)
    message.push(comment.body)

    return {
      referenceId: this.referenceIdForIssue(issue, repository),
      subject: this.subjectForIssue(issue, repository),
      message: message.join('\n'),
    }
  }

  issues(payload) {
    if (['opened', 'closed', 'reopened'].indexOf(payload.action) == -1) return

    var { issue, repository, sender } = payload
    var message = []

    message.push(`${this.link(issue.html_url, 'Issue')} ${payload.action} by ${this.userLink(sender)}`)
    if (payload.action == 'opened') {
      message.push(issue.body)
    }

    return {
      referenceId: this.referenceIdForIssue(issue, repository),
      subject: this.subjectForIssue(issue, repository),
      message: message.join('\n'),
    }
  }

  member (payload) {
    if (['added'].indexOf(payload.action) == -1) return

    var { member, repository, sender } = payload
    var message = []

    message.push(`${this.userLink(sender)} added ${this.userLink(member)} as a collaborator`)

    return {
      referenceId: repository.id,
      subject: `[${repository.full_name}]`,
      message: message.join('\n'),
    }
  }

  page_build (payload) {
    if (['built', 'errored'].indexOf(payload.build.status) == -1) return

    var { build, repository } = payload
    var message = []

    switch (build.status) {
      case 'built':
        message.push(`Page was successfully built: ${this.pageLink(repository)}`)
        break

      case 'errored':
        message.push(`There was an error building the page: ${this.pageLink(repository)}`)
        break
    }

    return {
      referenceId: repository.id,
      subject: `[${repository.full_name}]`,
      message: message.join('\n'),
    }
  }

  public (payload) {
    var { repository, sender } = payload
    var message = []

    message.push(`${this.userLink(sender)} open sourced ${this.link(repository.html_url, repository.name)}`)

    return {
      referenceId: repository.id,
      subject: `[${repository.full_name}]`,
      message: message.join('\n'),
    }
  }

  pull_request(payload) {
    if (['opened', 'closed', 'reopened'].indexOf(payload.action) == -1) return

    var { action, pull_request, repository, sender } = payload
    var message = []

    if (action == 'closed' && pull_request.merged) {
      action = 'merged'
    }

    message.push(`${this.link(pull_request.html_url, 'Pull request')} ${action} by ${this.userLink(sender)}`)
    if (action == 'opened') {
      message.push(pull_request.body)
    }

    return {
      referenceId: this.referenceIdForIssue(pull_request, repository),
      subject: this.subjectForIssue(pull_request, repository),
      message: message.join('\n'),
    }
  }

  pull_request_review_comment(payload) {
    if (['created'].indexOf(payload.action) == -1) return

    var { pull_request, comment, repository, sender } = payload
    var message = []

    message.push(`New ${this.link(comment.html_url, 'comment')} by ${this.userLink(sender)}`)
    message.push(comment.body)

    return {
      referenceId: this.referenceIdForIssue(pull_request, repository),
      subject: this.subjectForIssue(pull_request, repository),
      message: message.join('\n'),
    }
  }

  push (payload) {
    var { ref, created, deleted, forced, head_commit, compare, commits, repository, sender } = payload
    var message = [], firstLine, splits, branch, type, size, includeCommits

    splits = ref.split('/')
    type = splits[1]

    if (['heads'].indexOf(type) == -1) return

    branch = splits[splits.length - 1]
    size = commits.length

    if (created) {
      firstLine = `${this.userLink(sender)} created new branch ${this.branchLink(branch, repository)}`
      if (size > 0) {
        firstLine += ' and'
        includeCommits = true
      }
    } else if (deleted) {
      firstLine = `${this.userLink(sender)} deleted “${branch}”`
    } else if (forced) {
      firstLine = `${this.userLink(sender)} force-pushed ${this.branchLink(branch, repository)} to ${this.link(head_commit.url, this.shortCommit(head_commit.id))}`
    } else {
      firstLine = `${this.userLink(sender)}`
      includeCommits = true
    }

    if (includeCommits && size > 0) {
      firstLine += ` pushed ${this.link(compare, `${size} new commit${size > 1 ? 's' : ''}`)}`
      commits.forEach((commit) => {
        var msg = commit.message.split('\n')[0]
        message.push(`${this.link(commit.url, this.shortCommit(commit.id))} ${msg} - ${commit.author.name}`)
      })
    }

    message.unshift(firstLine)

    return {
      referenceId: `${repository.id}/${branch}`,
      subject: `[${repository.full_name}] ${branch}`,
      message: message.join('\n'),
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
