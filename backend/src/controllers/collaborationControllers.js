import {
    searchTasksService,
    shareTaskService,
    unshareTaskService,
    getSharedTasksService,
    getCommentsService,
    addCommentService,
    deleteCommentService,
} from "../services/collaborationServices.js";

export const searchTasks = async (req, res, next) => {
    try {
        const result = await searchTasksService(req.user.id, req.query);
        res.json(result);
    } catch (error) { next(error); }
};

export const shareTask = async (req, res, next) => {
    try {
        const result = await shareTaskService(req.user.id, req.params.id, req.body.email);
        res.json(result);
    } catch (error) { next(error); }
};

export const unshareTask = async (req, res, next) => {
    try {
        const result = await unshareTaskService(req.user.id, req.params.id, req.params.userId);
        res.json(result);
    } catch (error) { next(error); }
};

export const getSharedTasks = async (req, res, next) => {
    try {
        const tasks = await getSharedTasksService(req.user.id);
        res.json(tasks);
    } catch (error) { next(error); }
};

export const getComments = async (req, res, next) => {
    try {
        const comments = await getCommentsService(req.user.id, req.params.id);
        res.json(comments);
    } catch (error) { next(error); }
};

export const addComment = async (req, res, next) => {
    try {
        const comment = await addCommentService(req.user.id, req.params.id, req.body.content);
        // Emit real-time cho tất cả users trong task
        req.app.get("io")?.emit(`comment_${req.params.id}`, comment);
        res.status(201).json(comment);
    } catch (error) { next(error); }
};

export const deleteComment = async (req, res, next) => {
    try {
        const result = await deleteCommentService(req.user.id, req.params.commentId);
        res.json(result);
    } catch (error) { next(error); }
};
