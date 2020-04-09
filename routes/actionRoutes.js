const express = require("express");
const projects = require("../data/helpers/projectModel");
const actions = require("../data/helpers/actionModel");
const router = express.Router();

const {
    validateProjectId,
    validateActionId
} = require("../middleware/validateId");

router.get("/:id/actions", validateProjectId, (req, res) => {
    const { id } = req.params;

    projects
        .getProjectActions(id)
        .then(resp => res.status(200).send(resp))
        .catch(err =>
            res.status(500).json({ errorMessage: "Error retrieving actions" })
        );
});

router.get(
    "/:id/actions/:action_id",
    validateProjectId,
    validateActionId,
    (req, res) => {
        const { action_id } = req.params;

        actions
            .get(action_id)
            .then(resp => res.status(200).send(resp))
            .catch(err =>
                res.status(500).json({
                    errorMessage: `Error retrieving action ${action_id}`
                })
            );
    }
);

router.post("/:id/actions", validateProjectId, (req, res) => {
    const { id } = req.params;
    const projectAction = { ...req.body, project_id: id };

    if (!projectAction || Object.keys(projectAction).length === 0) {
        res.status(400).json({ errorMessage: `Missing action data` });
    } else if (!projectAction.description || !projectAction.notes) {
        res.status(400).json({
            errorMessage: `Please include a description and notes`
        });
    } else if (projectAction.description.length > 128) {
        res.status(400).json({
            errorMessage: `Action description must be 128 characters or less`
        });
    } else {
        actions
            .insert(projectAction)
            .then(resp => res.status(200).send(resp))
            .catch(err =>
                res.status(500).json({
                    errorMessage: `Error creating new action for project ${id}`
                })
            );
    }
});

router.put(
    "/:id/actions/:action_id",
    validateProjectId,
    validateActionId,
    (req, res) => {
        const { id, action_id } = req.params;

        const updatedAction = req.body;

        if (
            updatedAction.description &&
            updatedAction.description.length > 128
        ) {
            res.status(400).json({
                errorMessage: "Description must be 128 characters or less"
            });
        } else {
            actions
                .update(action_id, updatedAction)
                .then(response => {
                    response
                        ? res.status(200).send(response)
                        : res.status(404).json({
                              errorMessage: `Action with id ${action_id} does not exist`
                          });
                })
                .catch(err =>
                    res.status(500).json({
                        errorMessage: `Error updating action ${action_id}`
                    })
                );
        }
    }
);

router.delete(
    "/:id/actions/:action_id",
    validateProjectId,
    validateActionId,
    (req, res) => {
        const { action_id } = req.params;

        actions
            .remove(action_id)
            .then(resp => {
                resp > 0
                    ? res.status(200).json({
                          message: `Action ${action_id} was successfully delete`
                      })
                    : res.status(400).json({
                          errorMessage: `No action with id ${action_id} was found`
                      });
            })
            .catch(err =>
                res.status(500).json({
                    errorMessage: `Error deleting action ${action_id}`
                })
            );
    }
);

module.exports = router;