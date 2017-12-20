const { github } = require('./lib/integrations')
const types = [
  'create',
  'pull_request',
  'push_commit',
  'push_tag',
]

console.log('============');
console.log('== GitHub ==');
console.log('============');
types.map((type) => {
  let { payload, req } = require(`./fixtures/github/${type}`)
  console.log(`\n-- ${type} --`);
  console.log(github.process(payload, req));
})
