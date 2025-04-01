'use strict';
const Issue = require('../models/issue.js');
const mongoose = require('mongoose');

module.exports = function (app) {
  app.route('/api/issues/:project')

    .get(async function (req, res) {
      try {
        const project = req.params.project;
        const query = { project, ...req.query };
        const issues = await Issue.find(query);
        res.json(issues);
      } catch (err) {
        res.status(500).send('Server Error');
      }
    })

    .post(async function (req, res) {
      try {
        const project = req.params.project;
        const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

        if (!issue_title || !issue_text || !created_by) {
          return res.send('required field(s) missing');
        }

        const newIssue = new Issue({
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || '',
          project,
          created_on: new Date(),
          updated_on: new Date(),
          open: true
        });

        const savedIssue = await newIssue.save();
        res.json(savedIssue);
      } catch (err) {
        res.status(500).send('Server Error');
      }
    })

    .put(async function (req, res) {
      try {
        const { _id, ...fields } = req.body;
        if (!_id) return res.json({ error: 'missing _id' });

        const hasUpdates = Object.keys(fields).some(key => fields[key] !== '' && key !== '_id');
        if (!hasUpdates) return res.json({ error: 'no update field(s) sent', _id });

        if (!mongoose.Types.ObjectId.isValid(_id)) {
          return res.json({ error: 'could not update', _id });
        }

        const updates = { ...fields, updated_on: new Date() };
        const updated = await Issue.findByIdAndUpdate(_id, updates, { new: true });
        if (!updated) return res.json({ error: 'could not update', _id });

        res.json({ result: 'success', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id: req.body._id });
      }
    })

    .delete(async function (req, res) {
      try {
        const { _id } = req.body;
        if (!_id) return res.json({ error: 'missing _id' });

        if (!mongoose.Types.ObjectId.isValid(_id)) {
          return res.json({ error: 'could not delete', _id });
        }

        const deleted = await Issue.findByIdAndDelete(_id);
        if (!deleted) return res.json({ error: 'could not delete', _id });

        res.json({ result: 'success', _id });
      } catch (err) {
        res.json({ error: 'could not delete', _id: req.body._id });
      }
    });
};