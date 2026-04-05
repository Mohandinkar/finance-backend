export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {

        const zodErrors = err.errors || [];

        const mappedErrors = zodErrors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));

        return res.status(400).json({
            success: false,
            message: mappedErrors.length > 0 ? 'Validation failed' : err.message,
            errors: mappedErrors,
        });
    }
};