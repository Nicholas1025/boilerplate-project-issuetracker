const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

  const project = 'test-project';
  let createdId;

  test('Create issue with every field', function (done) {
    chai.request(server)
      .post('/api/issues/' + project)
      .send({
        issue_title: 'Title',
        issue_text: 'Text',
        created_by: 'Chai Test',
        assigned_to: 'Tester',
        status_text: 'In QA'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.equal(res.body.issue_title, 'Title');
        createdId = res.body._id;
        done();
      });
  });

  test('Create issue with only required fields', function (done) {
    chai.request(server)
      .post('/api/issues/' + project)
      .send({
        issue_title: 'Required only',
        issue_text: 'Just text',
        created_by: 'Tester'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.equal(res.body.issue_title, 'Required only');
        done();
      });
  });

  test('Create issue with missing required fields', function (done) {
    chai.request(server)
      .post('/api/issues/' + project)
      .send({
        issue_title: '',
        issue_text: '',
        created_by: ''
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'required field(s) missing');
        done();
      });
  });

  test('View issues on a project', function (done) {
    chai.request(server)
      .get('/api/issues/' + project)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test('View issues on a project with one filter', function (done) {
    chai.request(server)
      .get('/api/issues/' + project + '?created_by=Chai Test')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test('View issues on a project with multiple filters', function (done) {
    chai.request(server)
      .get('/api/issues/' + project + '?created_by=Chai Test&issue_title=Title')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test('Update one field on an issue', function (done) {
    chai.request(server)
      .put('/api/issues/' + project)
      .send({
        _id: createdId,
        status_text: 'Updated status'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'success');
        assert.equal(res.body._id, createdId);
        done();
      });
  });

  test('Update multiple fields on an issue', function (done) {
    chai.request(server)
      .put('/api/issues/' + project)
      .send({
        _id: createdId,
        issue_title: 'New title',
        issue_text: 'New text'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'success');
        assert.equal(res.body._id, createdId);
        done();
      });
  });

  test('Update an issue with missing _id', function (done) {
    chai.request(server)
      .put('/api/issues/' + project)
      .send({ issue_text: 'Nothing' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('Update an issue with no fields to update', function (done) {
    chai.request(server)
      .put('/api/issues/' + project)
      .send({ _id: createdId })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  test('Update an issue with invalid _id', function (done) {
    chai.request(server)
      .put('/api/issues/' + project)
      .send({ _id: 'invalidid123', issue_text: 'Won’t update' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  test('Delete an issue', function (done) {
    chai.request(server)
      .delete('/api/issues/' + project)
      .send({ _id: createdId })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'success');
        assert.equal(res.body._id, createdId);
        done();
      });
  });

  test('Delete an issue with invalid _id', function (done) {
    chai.request(server)
      .delete('/api/issues/' + project)
      .send({ _id: 'invalidid123' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });

  test('Delete an issue with missing _id', function (done) {
    chai.request(server)
      .delete('/api/issues/' + project)
      .send({})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

});