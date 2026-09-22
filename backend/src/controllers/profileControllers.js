import {
    getProfileService,
    updateProfileService,
    changePasswordService,
    exportDataService,
} from "../services/profileServices.js";

export const getProfile = async (req, res, next) => {
    try {
        const user = await getProfileService(req.user.id);
        res.json(user);
    } catch (error) { next(error); }
};

export const updateProfile = async (req, res, next) => {
    try {
        const user = await updateProfileService(req.user.id, req.body);
        res.json(user);
    } catch (error) { next(error); }
};

export const changePassword = async (req, res, next) => {
    try {
        const result = await changePasswordService(req.user.id, req.body);
        res.json(result);
    } catch (error) { next(error); }
};

export const exportData = async (req, res, next) => {
    try {
        const format = req.query.format || "json";
        const data = await exportDataService(req.user.id, format);
        
        if (format === "csv") {
            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader("Content-Disposition", `attachment; filename="tasks_export_${new Date().toISOString().slice(0, 10)}.csv"`);
            res.send("\uFEFF" + data); // BOM cho Excel đọc đúng UTF-8
        } else {
            res.json(data);
        }
    } catch (error) { next(error); }
};
