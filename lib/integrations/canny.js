const Integration = require('../integration')

const COLORS = {
  comment: '#999',
  vote: '#535df0',
  status: {
    open: '#999',
    under_review: '#85b5b5',
    planned: '#1fa0ff',
    in_progress: '#c17aff',
    complete: '#6dd345',
    closed: '#ed2b2b',
  },
}

class Canny extends Integration {
  get id() { return 'canny' }

  process(payload, req) {
    let type = payload.type.replace('.', '_')

    if (this[type]) {
      return this[type](payload)
    }
  }

  // Supported event types
  post_created(payload) {
    let { object } = payload
    let { id, author, board, details, title, url, imageURLs } = object

    let pretext = this.sanitize(() => `${author.name} created a new post in ${this.boardLink(board)}`)
    let imageURL = undefined
    let color = this.getColorForPost(object)

    if (imageURLs && imageURLs.length) {
      imageURL = imageURLs[0]
    }

    return {
      references: [`${board.id}/${id}`],
      subject: title,
      color: color,
      notification: pretext.sanitized,
      attachment: {
        pretext: pretext.toString(),
        title: title,
        title_link: url,
        text: details,
        image_url: imageURL,
        color: color,
      }
    }
  }

  post_status_changed(payload) {
    let { object } = payload
    let { id, board, title, status, changeComment } = object

    let text = this.sanitize(() => `${this.postLink(object, board)} has been marked as *${status}*`)
    let color = this.getColorForPost(object)

    let attachments = [
      {
        text: text.toString(),
        color: color,
      }
    ]

    if (changeComment) {
      let { imageURLs, value } = changeComment
      let imageURL = undefined

      if (imageURLs && imageURLs.length) {
        imageURL = imageURLs[0]
      }

      if (value || imageURL) {
        attachments.push({
          text: value,
          image_url: imageURL,
          color: COLORS.comment,
        })
      }
    }

    return {
      references: [`${board.id}/${id}`],
      subject: title,
      color: color,
      notification: text.sanitized,
      attachments: attachments,
    }
  }

  vote_created(payload) {
    let { object } = payload
    let { board, post } = object

    if (post.score % 5) return

    let text = this.sanitize(() => `${this.postLink(post, board)} hit *${post.score} votes*`)

    return {
      references: [`${board.id}/${post.id}`],
      subject: post.title,
      color: this.getColorForPost(post),
      notification: text.sanitized,
      attachment: {
        text: text.toString(),
        color: COLORS.vote,
      }
    }
  }

  comment_created(payload) {
    let { object } = payload
    let { author, board, post, value, imageURLs } = object

    let pretext = this.sanitize(() => `${author.name} posted a new comment in ${this.postLink(post, board)}`)
    let imageURL = undefined

    if (imageURLs && imageURLs.length) {
      imageURL = imageURLs[0]
    }

    return {
      references: [`${board.id}/${post.id}`],
      subject: post.title,
      color: this.getColorForPost(post),
      notification: pretext.sanitized,
      attachment: {
        pretext: pretext.toString(),
        text: value,
        color: COLORS.comment,
        image_url: imageURL,
      }
    }
  }

  // Helpers
  getColorForPost(post) {
    let { status } = post
    status = status.replace(/\s/g, '_')

    return COLORS.status[status]
  }

  boardLink(board) {
    return this.link(board.url, board.name)
  }

  postLink(post, board) {
    let title = post.title

    if (board) {
      title = `${board.name}: ${title}`
    }

    return this.link(post.url, title)
  }
}

module.exports = Canny
