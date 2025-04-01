'use strict';

const Issue = require('../models/issue.js');
const mongoose = require('mongoose');

module.exports = function (app) {
  app.route('/api/issues/:project')

    .get(async function (req, res) {
      try {
        const project = req.params.project;
        const filter = { project, ...req.query };
        const issues = await Issue.find(filter).select('-__v -project');
        res.json(issues);
      } catch (err) {
        res.status(500).json({ error: 'server error' });
      }
    })

    .post(async function (req, res) {
      try {
        const project = req.params.project;
        const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

        if (!issue_title || !issue_text || !created_by) {
          return res.json({ error: 'required field(s) missing' });
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

        const response = savedIssue.toObject();
        delete response.__v;
        delete response.project;

        res.json(response);
      } catch (err) {
        res.status(500).json({ error: 'server error' });
      }
    })

    .put(async function (req, res) {
      try {
        const { _id, ...fields } = req.body;

        if (!_id) return res.json({ error: 'missing _id' });
        if (!mongoose.Types.ObjectId.isValid(_id)) return res.json({ error: 'could not update', _id });

        const updateFields = Object.fromEntries(
          Object.entries(fields).filter(([k, v]) => v !== '' && k !== '_id')
        );

        if (Object.keys(updateFields).length === 0) return res.json({ error: 'no update field(s) sent', _id });

        updateFields.updated_on = new Date();
        const updated = await Issue.findByIdAndUpdate(_id, updateFields, { new: true });

        if (!updated) return res.json({ error: 'could not update', _id });

        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id: req.body._id });
      }
    })

    .delete(async function (req, res) {
      try {
        const { _id } = req.body;

        if (!_id) return res.json({ error: 'missing _id' });
        if (!mongoose.Types.ObjectId.isValid(_id)) return res.json({ error: 'could not delete', _id });

        const deleted = await Issue.findByIdAndDelete(_id);
        if (!deleted) return res.json({ error: 'could not delete', _id });

        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.json({ error: 'could not delete', _id: req.body._id });
      }
    });
};
