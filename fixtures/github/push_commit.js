module.exports = {
  req: {
    get: () => {
      return 'push'
    }
  },

  payload: {
    "ref": "refs/heads/master",
    "before": "1a4a44e449d8cde2c08040df6f69fb5d362e5576",
    "after": "bb2aff1c3f185cdac5c564e167e9f685df401fc3",
    "created": false,
    "deleted": false,
    "forced": false,
    "base_ref": null,
    "compare": "https://github.com/missive/emoji-mart/compare/1a4a44e449d8...bb2aff1c3f18",
    "commits": [
      {
        "id": "453f723d5e9d541ee041e21bb676fcec5d844285",
        "tree_id": "5624ed8c3e09ee20c658690cf9fbffaf6ae01fe1",
        "distinct": true,
        "message": "Fix include / exclude [Fix #149]\nSince fdf3c2d",
        "timestamp": "2017-12-15T15:09:46-05:00",
        "url": "https://github.com/missive/emoji-mart/commit/453f723d5e9d541ee041e21bb676fcec5d844285",
        "author": {
          "name": "Etienne Lemay",
          "email": "etiennelemay21@gmail.com",
          "username": "EtienneLem"
        },
        "committer": {
          "name": "Etienne Lemay",
          "email": "etiennelemay21@gmail.com",
          "username": "EtienneLem"
        },
        "added": [

        ],
        "removed": [

        ],
        "modified": [
          "src/components/picker.js",
          "src/utils/emoji-index.js"
        ]
      },
      {
        "id": "e4977e4f0de0c45282e9b4ecc719fcf1e4286f63",
        "tree_id": "fbb04133803ff64f6d44ae4e52e58f4dfa2f1552",
        "distinct": true,
        "message": "Update emoji-datasource to 4.0.2",
        "timestamp": "2017-12-15T15:12:50-05:00",
        "url": "https://github.com/missive/emoji-mart/commit/e4977e4f0de0c45282e9b4ecc719fcf1e4286f63",
        "author": {
          "name": "Etienne Lemay",
          "email": "etiennelemay21@gmail.com",
          "username": "EtienneLem"
        },
        "committer": {
          "name": "Etienne Lemay",
          "email": "etiennelemay21@gmail.com",
          "username": "EtienneLem"
        },
        "added": [

        ],
        "removed": [

        ],
        "modified": [
          "package.json",
          "src/components/emoji.js",
          "yarn.lock"
        ]
      },
      {
        "id": "8f63c3830814e257e2931fa4d8a6fc0e240753ff",
        "tree_id": "f3d2e0058767dd77175d26090b65f735c3ee1d21",
        "distinct": true,
        "message": "Use 256-color indexed sheets by default\nReduces sheets size by half",
        "timestamp": "2017-12-15T15:23:15-05:00",
        "url": "https://github.com/missive/emoji-mart/commit/8f63c3830814e257e2931fa4d8a6fc0e240753ff",
        "author": {
          "name": "Etienne Lemay",
          "email": "etiennelemay21@gmail.com",
          "username": "EtienneLem"
        },
        "committer": {
          "name": "Etienne Lemay",
          "email": "etiennelemay21@gmail.com",
          "username": "EtienneLem"
        },
        "added": [

        ],
        "removed": [

        ],
        "modified": [
          "README.md",
          "src/components/emoji.js"
        ]
      },
      {
        "id": "1119d60b6e396e1da55f6d0a8bed5fa916272799",
        "tree_id": "bdb91001515b86ec3f9ed624476bed7b766a8653",
        "distinct": true,
        "message": "Use categories id in SVGs",
        "timestamp": "2017-12-15T15:30:58-05:00",
        "url": "https://github.com/missive/emoji-mart/commit/1119d60b6e396e1da55f6d0a8bed5fa916272799",
        "author": {
          "name": "Etienne Lemay",
          "email": "etiennelemay21@gmail.com",
          "username": "EtienneLem"
        },
        "committer": {
          "name": "Etienne Lemay",
          "email": "etiennelemay21@gmail.com",
          "username": "EtienneLem"
        },
        "added": [

        ],
        "removed": [

        ],
        "modified": [
          "src/components/anchors.js",
          "src/svgs/index.js"
        ]
      },
      {
        "id": "e78609b5c0589b7e79543e71c4cdb6c900f38232",
        "tree_id": "80203344f36bc98e3dfc2ffd74bad5ecee850083",
        "distinct": true,
        "message": ":lipstick:",
        "timestamp": "2017-12-15T15:31:49-05:00",
        "url": "https://github.com/missive/emoji-mart/commit/e78609b5c0589b7e79543e71c4cdb6c900f38232",
        "author": {
          "name": "Etienne Lemay",
          "email": "etiennelemay21@gmail.com",
          "username": "EtienneLem"
        },
        "committer": {
          "name": "Etienne Lemay",
          "email": "etiennelemay21@gmail.com",
          "username": "EtienneLem"
        },
        "added": [

        ],
        "removed": [

        ],
        "modified": [
          "src/components/emoji.js",
          "src/components/picker.js",
          "src/utils/emoji-index.js"
        ]
      },
      {
        "id": "c70568c3927ca53e95bce72121852bf38a3e070b",
        "tree_id": "a9b5b14106fcb09cd0064433796e3100039e50a6",
        "distinct": true,
        "message": "Revert \"Merge pull request #99 from chadoh/countries-search\"\nCountries name now properly handled in emoji-data\n\nThis reverts commit 2becc5a4aeeb88c01b6a73591895d7998924bef1, reversing\nchanges made to c21e1402b64e9f10f0a0eebb67f93791d654f06d.",
        "timestamp": "2017-12-15T15:51:25-05:00",
        "url": "https://github.com/missive/emoji-mart/commit/c70568c3927ca53e95bce72121852bf38a3e070b",
        "author": {
          "name": "Etienne Lemay",
          "email": "etiennelemay21@gmail.com",
          "username": "EtienneLem"
        },
        "committer": {
          "name": "Etienne Lemay",
          "email": "etiennelemay21@gmail.com",
          "username": "EtienneLem"
        },
        "added": [

        ],
        "removed": [

        ],
        "modified": [
          "scripts/build-data.js"
        ]
      },
      {
        "id": "373c0090659cbfee644ce9901596565d9552e265",
        "tree_id": "76233621aff5647744b5a9ece56b4c57b44310bf",
        "distinct": true,
        "message": "Update gh-pages",
        "timestamp": "2017-12-15T15:56:51-05:00",
        "url": "https://github.com/missive/emoji-mart/commit/373c0090659cbfee644ce9901596565d9552e265",
        "author": {
          "name": "Etienne Lemay",
          "email": "etiennelemay21@gmail.com",
          "username": "EtienneLem"
        },
        "committer": {
          "name": "Etienne Lemay",
          "email": "etiennelemay21@gmail.com",
          "username": "EtienneLem"
        },
        "added": [

        ],
        "removed": [

        ],
        "modified": [
          "docs/bundle.js"
        ]
      },
      {
        "id": "bb2aff1c3f185cdac5c564e167e9f685df401fc3",
        "tree_id": "36f4d1e77ebf48f58ea45e73bf3640c141ed807d",
        "distinct": true,
        "message": "Release v2.4.0",
        "timestamp": "2017-12-15T15:56:56-05:00",
        "url": "https://github.com/missive/emoji-mart/commit/bb2aff1c3f185cdac5c564e167e9f685df401fc3",
        "author": {
          "name": "Etienne Lemay",
          "email": "etiennelemay21@gmail.com",
          "username": "EtienneLem"
        },
        "committer": {
          "name": "Etienne Lemay",
          "email": "etiennelemay21@gmail.com",
          "username": "EtienneLem"
        },
        "added": [

        ],
        "removed": [

        ],
        "modified": [
          "package.json"
        ]
      }
    ],
    "head_commit": {
      "id": "bb2aff1c3f185cdac5c564e167e9f685df401fc3",
      "tree_id": "36f4d1e77ebf48f58ea45e73bf3640c141ed807d",
      "distinct": true,
      "message": "Release v2.4.0",
      "timestamp": "2017-12-15T15:56:56-05:00",
      "url": "https://github.com/missive/emoji-mart/commit/bb2aff1c3f185cdac5c564e167e9f685df401fc3",
      "author": {
        "name": "Etienne Lemay",
        "email": "etiennelemay21@gmail.com",
        "username": "EtienneLem"
      },
      "committer": {
        "name": "Etienne Lemay",
        "email": "etiennelemay21@gmail.com",
        "username": "EtienneLem"
      },
      "added": [

      ],
      "removed": [

      ],
      "modified": [
        "package.json"
      ]
    },
    "repository": {
      "id": 63091815,
      "name": "emoji-mart",
      "full_name": "missive/emoji-mart",
      "owner": {
        "name": "missive",
        "email": "info@missiveapp.com",
        "login": "missive",
        "id": 6352330,
        "avatar_url": "https://avatars2.githubusercontent.com/u/6352330?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/missive",
        "html_url": "https://github.com/missive",
        "followers_url": "https://api.github.com/users/missive/followers",
        "following_url": "https://api.github.com/users/missive/following{/other_user}",
        "gists_url": "https://api.github.com/users/missive/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/missive/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/missive/subscriptions",
        "organizations_url": "https://api.github.com/users/missive/orgs",
        "repos_url": "https://api.github.com/users/missive/repos",
        "events_url": "https://api.github.com/users/missive/events{/privacy}",
        "received_events_url": "https://api.github.com/users/missive/received_events",
        "type": "Organization",
        "site_admin": false
      },
      "private": false,
      "html_url": "https://github.com/missive/emoji-mart",
      "description": "One component to pick them all 👊🏼",
      "fork": false,
      "url": "https://github.com/missive/emoji-mart",
      "forks_url": "https://api.github.com/repos/missive/emoji-mart/forks",
      "keys_url": "https://api.github.com/repos/missive/emoji-mart/keys{/key_id}",
      "collaborators_url": "https://api.github.com/repos/missive/emoji-mart/collaborators{/collaborator}",
      "teams_url": "https://api.github.com/repos/missive/emoji-mart/teams",
      "hooks_url": "https://api.github.com/repos/missive/emoji-mart/hooks",
      "issue_events_url": "https://api.github.com/repos/missive/emoji-mart/issues/events{/number}",
      "events_url": "https://api.github.com/repos/missive/emoji-mart/events",
      "assignees_url": "https://api.github.com/repos/missive/emoji-mart/assignees{/user}",
      "branches_url": "https://api.github.com/repos/missive/emoji-mart/branches{/branch}",
      "tags_url": "https://api.github.com/repos/missive/emoji-mart/tags",
      "blobs_url": "https://api.github.com/repos/missive/emoji-mart/git/blobs{/sha}",
      "git_tags_url": "https://api.github.com/repos/missive/emoji-mart/git/tags{/sha}",
      "git_refs_url": "https://api.github.com/repos/missive/emoji-mart/git/refs{/sha}",
      "trees_url": "https://api.github.com/repos/missive/emoji-mart/git/trees{/sha}",
      "statuses_url": "https://api.github.com/repos/missive/emoji-mart/statuses/{sha}",
      "languages_url": "https://api.github.com/repos/missive/emoji-mart/languages",
      "stargazers_url": "https://api.github.com/repos/missive/emoji-mart/stargazers",
      "contributors_url": "https://api.github.com/repos/missive/emoji-mart/contributors",
      "subscribers_url": "https://api.github.com/repos/missive/emoji-mart/subscribers",
      "subscription_url": "https://api.github.com/repos/missive/emoji-mart/subscription",
      "commits_url": "https://api.github.com/repos/missive/emoji-mart/commits{/sha}",
      "git_commits_url": "https://api.github.com/repos/missive/emoji-mart/git/commits{/sha}",
      "comments_url": "https://api.github.com/repos/missive/emoji-mart/comments{/number}",
      "issue_comment_url": "https://api.github.com/repos/missive/emoji-mart/issues/comments{/number}",
      "contents_url": "https://api.github.com/repos/missive/emoji-mart/contents/{+path}",
      "compare_url": "https://api.github.com/repos/missive/emoji-mart/compare/{base}...{head}",
      "merges_url": "https://api.github.com/repos/missive/emoji-mart/merges",
      "archive_url": "https://api.github.com/repos/missive/emoji-mart/{archive_format}{/ref}",
      "downloads_url": "https://api.github.com/repos/missive/emoji-mart/downloads",
      "issues_url": "https://api.github.com/repos/missive/emoji-mart/issues{/number}",
      "pulls_url": "https://api.github.com/repos/missive/emoji-mart/pulls{/number}",
      "milestones_url": "https://api.github.com/repos/missive/emoji-mart/milestones{/number}",
      "notifications_url": "https://api.github.com/repos/missive/emoji-mart/notifications{?since,all,participating}",
      "labels_url": "https://api.github.com/repos/missive/emoji-mart/labels{/name}",
      "releases_url": "https://api.github.com/repos/missive/emoji-mart/releases{/id}",
      "deployments_url": "https://api.github.com/repos/missive/emoji-mart/deployments",
      "created_at": 1468261427,
      "updated_at": "2017-12-14T17:11:14Z",
      "pushed_at": 1513371780,
      "git_url": "git://github.com/missive/emoji-mart.git",
      "ssh_url": "git@github.com:missive/emoji-mart.git",
      "clone_url": "https://github.com/missive/emoji-mart.git",
      "svn_url": "https://github.com/missive/emoji-mart",
      "homepage": "https://missive.github.io/emoji-mart",
      "size": 51462,
      "stargazers_count": 834,
      "watchers_count": 834,
      "language": "JavaScript",
      "has_issues": true,
      "has_projects": true,
      "has_downloads": true,
      "has_wiki": true,
      "has_pages": true,
      "forks_count": 113,
      "mirror_url": null,
      "archived": false,
      "open_issues_count": 22,
      "license": null,
      "forks": 113,
      "open_issues": 22,
      "watchers": 834,
      "default_branch": "master",
      "stargazers": 834,
      "master_branch": "master",
      "organization": "missive"
    },
    "pusher": {
      "name": "EtienneLem",
      "email": "etienne@heliom.ca"
    },
    "organization": {
      "login": "missive",
      "id": 6352330,
      "url": "https://api.github.com/orgs/missive",
      "repos_url": "https://api.github.com/orgs/missive/repos",
      "events_url": "https://api.github.com/orgs/missive/events",
      "hooks_url": "https://api.github.com/orgs/missive/hooks",
      "issues_url": "https://api.github.com/orgs/missive/issues",
      "members_url": "https://api.github.com/orgs/missive/members{/member}",
      "public_members_url": "https://api.github.com/orgs/missive/public_members{/member}",
      "avatar_url": "https://avatars2.githubusercontent.com/u/6352330?v=4",
      "description": "The one app for team email and chat."
    },
    "sender": {
      "login": "EtienneLem",
      "id": 436043,
      "avatar_url": "https://avatars1.githubusercontent.com/u/436043?v=4",
      "gravatar_id": "",
      "url": "https://api.github.com/users/EtienneLem",
      "html_url": "https://github.com/EtienneLem",
      "followers_url": "https://api.github.com/users/EtienneLem/followers",
      "following_url": "https://api.github.com/users/EtienneLem/following{/other_user}",
      "gists_url": "https://api.github.com/users/EtienneLem/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/EtienneLem/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/EtienneLem/subscriptions",
      "organizations_url": "https://api.github.com/users/EtienneLem/orgs",
      "repos_url": "https://api.github.com/users/EtienneLem/repos",
      "events_url": "https://api.github.com/users/EtienneLem/events{/privacy}",
      "received_events_url": "https://api.github.com/users/EtienneLem/received_events",
      "type": "User",
      "site_admin": false
    }
  }
}
