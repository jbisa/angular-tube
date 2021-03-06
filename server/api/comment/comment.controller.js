/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/comments              ->  index
 * POST    /api/comments              ->  create
 * GET     /api/comments/:id          ->  show
 * PUT     /api/comments/:id          ->  update
 * DELETE  /api/comments/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
var Comment = require('./comment.model');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

// Gets a list of Comments
export function index(req, res) {
  Comment.findAsync()
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Gets a single Comment from the DB
export function show(req, res) {
  Comment.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Creates a new Comment in the DB
export function create(req, res) {
  Comment.createAsync(req.body)
    .then(responseWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Comment in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Comment.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Deletes a Comment from the DB
export function destroy(req, res) {
  Comment.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

// Get list of comments
exports.index = function(req, res) {
  Comment.loadRecent(function (err, comments) {
    if(err) { return handleError(res, err); }
    return res.json(200, comments);
  });
};
 
// Creates a new comment in the DB.
exports.create = function(req, res) {
  // don't include the date, if a user specified it
  delete req.body.date;
 
  var comment = new Comment(_.merge({ author: req.user._id }, req.body));
  comment.save(function(err, comment) {
    if(err) { return handleError(res, err); }
    return res.json(201, comment);
  });
};
