/*
play this: https://www.youtube.com/watch?v=d-diB65scQU

Sing along:

here's a little code I wrote, please read the README word for word, don't worry, you got this
in every task there may be trouble, but if you worry you make it double, don't worry, you got this
ain't got no sense of what is REST? just concentrate on learning Express, don't worry, you got this
your file is getting way too big, bring a Router and make it thin, don't worry, be crafty
there is no data on that route, just write some code, you'll sort it out… don't worry, just hack it…
I need this code, but don't know where, perhaps should make some middleware, don't worry, just hack it

Go code!
*/
const { validateProjectId } = require("./middleware/validateId");
const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const projects = require("./data/helpers/projectModel");
const actionRoutes = require("./routes/actionRoutes");

const server = express();
("");
const port = 3000;
const baseUrl = "/";

server.use(cors());
server.use(
    logger(":method :url :status :res[content-length] - :response-time ms")
);
server.use(express.json());
server.use(`${baseUrl}`, actionRoutes);

server.get("/", (req, res) => {
    projects
        .get()
        .then(resp => {
            res.status(200).send(resp);
        })
        .catch(err =>
            res
                .status(500)
                .json({ errorMessage: "Error retrieving projects from server" })
        );
});

server.get("/:id", validateProjectId, (req, res) => {
    const { id } = req.params;

    projects
        .get(id)
        .then(resp => res.status(200).send(resp))
        .catch(err =>
            res.status(500).json({
                errorMessage: `Error retrieving projects for id ${id} from server`
            })
        );
});

server.post("/", (req, res) => {
    const project = req.body;

    if (!project || Object.keys(project).length === 0) {
        res.status(400).json({ errorMessage: "Missing project data" });
    } else if (!project.name || !project.description) {
        res.status(400).json({
            errorMessage: "Please include a name and description"
        });
    } else {
        projects
            .insert(project)
            .then(resp => res.status(200).send(resp))
            .catch(err =>
                res
                    .status(500)
                    .json({ errorMessage: "Error posting new project" })
            );
    }
});

server.put("/:id", validateProjectId, (req, res) => {
    const { id } = req.params;
    const updatedProject = req.body;

    projects
        .update(id, updatedProject)
        .then(response => {
            response
                ? res.status(200).send(response)
                : res.status(404).json({
                      errorMessage: `Project with id ${id} does not exist`
                  });
        })
        .catch(err =>
            res
                .status(500)
                .json({ errorMessage: `Error updating project with id ${id}` })
        );
});

server.delete("/:id", validateProjectId, (req, res) => {
    const { id } = req.params;

    projects
        .remove(id)
        .then(resp => {
            resp > 0
                ? res.status(200).json({
                      message: `Project ${id} was successfully deleted`
                  })
                : res.status(400).json({
                      errorMessage: `No project with id ${id} was found`
                  });
        })
        .catch(err =>
            res
                .status(500)
                .json({ errorMessage: `Error deleting project ${id}` })
        );
});

server.listen(port, () => console.log(`Server listening on port ${port}`));