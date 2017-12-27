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

    return {
      referenceId: `${repository.id}/${comment.commit_id}`,
      subject: `[${repository.full_name}] ${this.shortCommit(comment.commit_id)}`,
      attachment: {
        pretext: `New ${this.link(comment.html_url, 'comment')} by ${this.userLink(sender)}`,
        text: comment.body,
      }
    }
  }

  create (payload) {
    if (['tag'].indexOf(payload.ref_type) == -1) return
    var { ref, ref_type, repository, sender } = payload

    return {
      referenceId: `${repository.id}/${ref}`,
      subject: `[${repository.full_name}] ${ref}`,
      attachment: {
        text: `New ${ref_type} ${this.branchLink(ref, repository)} was pushed by ${this.userLink(sender)}`,
      }
    }
  }

  delete (payload) {
    if (['tag'].indexOf(payload.ref_type) == -1) return
    var { ref, ref_type, repository, sender } = payload

    return {
      referenceId: `${repository.id}/${ref}`,
      subject: `[${repository.full_name}] ${ref}`,
      attachment: {
        text: `The ${ref_type} “${ref}” was deleted by ${this.userLink(sender)}`,
      }
    }
  }

  deployment (payload) { /* TODO */ }
  deployment_status (payload) { /* TODO */ }

  fork (payload) {
    var { forkee, repository, sender } = payload

    return {
      referenceId: repository.id,
      subject: `[${repository.full_name}]`,
      attachment: {
        text: `${repository.name} was forked by ${this.userLink(sender)} at ${this.link(forkee.html_url, forkee.full_name)}`,
      }
    }
  }

  gollum (payload) { /* TODO */ }

  issue_comment(payload) {
    if (['created'].indexOf(payload.action) == -1) return
    var { issue, comment, repository, sender } = payload

    return {
      referenceId: this.referenceIdForIssue(issue, repository),
      subject: this.subjectForIssue(issue, repository),
      attachment: {
        pretext: `New ${this.link(comment.html_url, 'comment')} by ${this.userLink(sender)}`,
        text: comment.body,
      }
    }
  }

  issues(payload) {
    if (['opened', 'closed', 'reopened'].indexOf(payload.action) == -1) return
    var { issue, repository, sender } = payload

    var text, pretext = `${this.link(issue.html_url, 'Issue')} ${payload.action} by ${this.userLink(sender)}`
    if (payload.action == 'opened') {
      text = issue.body
    } else {
      text = pretext
      pretext = undefined
    }

    return {
      referenceId: this.referenceIdForIssue(issue, repository),
      subject: this.subjectForIssue(issue, repository),
      attachment: { pretext, text },
    }
  }

  member (payload) {
    if (['added'].indexOf(payload.action) == -1) return
    var { member, repository, sender } = payload

    return {
      referenceId: repository.id,
      subject: `[${repository.full_name}]`,
      attachment: {
        text: `${this.userLink(sender)} added ${this.userLink(member)} as a collaborator`,
      }
    }
  }

  page_build (payload) {
    if (['built', 'errored'].indexOf(payload.build.status) == -1) return
    var { build, repository } = payload

    var text
    switch (build.status) {
      case 'built':
        text = `Page was successfully built: ${this.pageLink(repository)}`
        break

      case 'errored':
        text = `There was an error building the page: ${this.pageLink(repository)}`
        break
    }

    return {
      referenceId: repository.id,
      subject: `[${repository.full_name}]`,
      attachment: { text },
    }
  }

  public (payload) {
    var { repository, sender } = payload

    return {
      referenceId: repository.id,
      subject: `[${repository.full_name}]`,
      attachment: {
        text: `${this.userLink(sender)} open sourced ${this.link(repository.html_url, repository.name)}`,
      },
    }
  }

  pull_request(payload) {
    if (['opened', 'closed', 'reopened'].indexOf(payload.action) == -1) return

    var { action, pull_request, repository, sender } = payload
    var text, pretext

    if (action == 'closed' && pull_request.merged) {
      action = 'merged'
    }

    pretext = `${this.link(pull_request.html_url, 'Pull request')} ${action} by ${this.userLink(sender)}`

    if (action == 'opened') {
      text = pull_request.body
    } else {
      text = pretext
      pretext = undefined
    }

    return {
      referenceId: this.referenceIdForIssue(pull_request, repository),
      subject: this.subjectForIssue(pull_request, repository),
      attachment: { pretext, text },
    }
  }

  pull_request_review_comment(payload) {
    if (['created'].indexOf(payload.action) == -1) return
    var { pull_request, comment, repository, sender } = payload

    return {
      referenceId: this.referenceIdForIssue(pull_request, repository),
      subject: this.subjectForIssue(pull_request, repository),
      attachment: {
        pretext: `New ${this.link(comment.html_url, 'comment')} by ${this.userLink(sender)}`,
        text: comment.body,
      }
    }
  }

  push (payload) {
    var { ref, created, deleted, forced, head_commit, compare, commits, repository, sender } = payload
    var text = [], pretext, splits, branch, type, size, includeCommits

    splits = ref.split('/')
    type = splits[1]

    if (['heads'].indexOf(type) == -1) return

    branch = splits[splits.length - 1]
    size = commits.length

    if (created) {
      pretext = `${this.userLink(sender)} created new branch ${this.branchLink(branch, repository)}`
      if (size > 0) {
        pretext += ' and'
        includeCommits = true
      }
    } else if (deleted) {
      pretext = `${this.userLink(sender)} deleted “${branch}”`
    } else if (forced) {
      pretext = `${this.userLink(sender)} force-pushed ${this.branchLink(branch, repository)} to ${this.link(head_commit.url, this.shortCommit(head_commit.id))}`
    } else {
      pretext = `${this.userLink(sender)}`
      includeCommits = true
    }

    if (includeCommits && size > 0) {
      pretext += ` pushed ${this.link(compare, `${size} new commit${size > 1 ? 's' : ''}`)}`
      commits.forEach((commit) => {
        var msg = commit.message.split('\n')[0]
        text.push(`${this.codeLink(commit.url, this.shortCommit(commit.id))} ${msg} - ${commit.author.name}`)
      })

      text = text.join('\n')
    }

    if (!text.length) {
      text = pretext
      pretext = undefined
    }

    return {
      referenceId: `${repository.id}/${branch}`,
      subject: `[${repository.full_name}] ${branch}`,
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
