# Testing Grunt Tasks

This is the codebase used for Engineering meeting about Grunt tasks.

The goals are:

* how to refactor that in modular code
* how to test it

**How to write is tight to how to test**.

# Tools used

* [Node.js](http://nodejs.org) – [API Documentation](http://nodejs.org/api/index.html)
* [Grunt](http://gruntjs.com/getting-started) — [API Documentation](http://gruntjs.com/api/grunt)
* [Chai Assertion Library](http://chaijs.com/) — [BDD API Documentation](http://chaijs.com/api/bdd/)
* [Sinon.js](http://sinonjs.org/) — [API Documentation](http://sinonjs.org/docs/)

# Install

```bash
git clone https://github.com/oncletom/grunt-testing-workshop.git
npm install -g grunt-cli
npm install
```

# Run the task

```bash
grunt generateJS:english
```

# Run the tests

```bash
grunt test
```
