import {
    getProjectsService,
    createProjectService,
    updateProjectService,
    deleteProjectService,
} from "../services/projectsServices.js";

export const getProjects = async (req, res, next) => {
    try {
        const projects = await getProjectsService(req.user.id);
        res.json(projects);
    } catch (error) { next(error); }
};

export const createProject = async (req, res, next) => {
    try {
        const project = await createProjectService(req.user.id, req.body);
        res.status(201).json(project);
    } catch (error) { next(error); }
};

export const updateProject = async (req, res, next) => {
    try {
        const project = await updateProjectService(req.user.id, req.params.id, req.body);
        res.json(project);
    } catch (error) { next(error); }
};

export const deleteProject = async (req, res, next) => {
    try {
        const result = await deleteProjectService(req.user.id, req.params.id);
        res.json(result);
    } catch (error) { next(error); }
};
