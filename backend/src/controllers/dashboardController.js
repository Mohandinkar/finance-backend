import Record from '../models/Record.js';

export const getDashboardSummary = async (req, res) => {
    try {
        const summary = await Record.aggregate([
            {
                $facet: {

                    totals: [
                        {
                            $group: {
                                _id: '$type',
                                total: { $sum: '$amount' }
                            }
                        }
                    ],

                    categoryBreakdown: [
                        {
                            $group: {
                                _id: { type: '$type', category: '$category' },
                                total: { $sum: '$amount' }
                            }
                        },
                        { $sort: { total: -1 } }
                    ],

                    recentActivity: [
                        { $sort: { date: -1 } },
                        { $limit: 5 },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'createdBy',
                                foreignField: '_id',
                                as: 'creator'
                            }
                        },
                        { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                amount: 1, type: 1, category: 1, date: 1,
                                'creator.name': 1
                            }
                        }
                    ],

                    monthlyPerformance: [
                        {
                            $group: {

                                _id: { month: { $month: "$date" }, year: { $year: "$date" } },

                                income: {
                                    $sum: { $cond: [{ $eq: ['$type', 'Income'] }, '$amount', 0] }
                                },

                                expense: {
                                    $sum: { $cond: [{ $eq: ['$type', 'Expense'] }, { $abs: '$amount' }, 0] }
                                }
                            }
                        },

                        { $sort: { '_id.year': 1, '_id.month': 1 } }
                    ]
                }
            }
        ]);

        const rawTotals = summary[0].totals;
        let totalIncome = 0;
        let totalExpense = 0;

        rawTotals.forEach(item => {
            if (item._id === 'Income') totalIncome = item.total;

            if (item._id === 'Expense') totalExpense = Math.abs(item.total);
        });

        const netBalance = totalIncome - totalExpense;

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const chartData = summary[0].monthlyPerformance.map(item => ({
            name: monthNames[item._id.month - 1],
            income: item.income,
            expense: item.expense
        }));

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalIncome,
                    totalExpense,
                    netBalance
                },
                categoryBreakdown: summary[0].categoryBreakdown.map(cat => ({
                    type: cat._id.type,
                    category: cat._id.category,
                    total: cat.total
                })),
                recentActivity: summary[0].recentActivity,
                chartData: chartData
            }
        });

    } catch (error) {
        console.error("Dashboard Aggregation Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};