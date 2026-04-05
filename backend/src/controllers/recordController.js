import Record from '../models/Record.js';

export const createRecord = async (req, res, next) => {
    try {
        const { amount, type, category, notes, date } = req.body;

        const record = await Record.create({
            amount,
            type,
            category,
            notes,
            date: date || undefined, // If date is provided, use it, else fallback to Mongoose default
            createdBy: req.user.id
        });

        res.status(201).json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

export const getRecords = async (req, res, next) => {
    try {
        let query = {};
        const { type, category, startDate, endDate } = req.query;

        if (type) query.type = type;
        if (category) query.category = category;

        // Date filtering
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        //pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        const skip = (page - 1) * limit;

        const totalRecords = await Record.countDocuments(query);

        const records = await Record.find(query)
            .populate('createdBy', 'name email role')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: records.length,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalRecords / limit),
                totalRecords: totalRecords
            },
            data: records
        });
    } catch (error) {
        next(error);
    }
};

export const updateRecord = async (req, res, next) => {
    try {
        let record = await Record.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        // Update the record with new data from req.body
        record = await Record.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Returns the updated document
            runValidators: true // Ensures Zod/Mongoose rules still apply on update
        });

        res.status(200).json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

export const deleteRecord = async (req, res, next) => {
    try {
        const record = await Record.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        // Delete the record from the database
        await record.deleteOne();

        res.status(200).json({ success: true, message: 'Record deleted successfully' });
    } catch (error) {
        next(error);
    }
};