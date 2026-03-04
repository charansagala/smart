const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TourismTrend = sequelize.define('TourismTrend', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    destination_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'destinations',
            key: 'id'
        }
    },
    month: {
        type: DataTypes.STRING,
        allowNull: false, // expected format e.g., '2025-01' or 'Jan'
    },
    visitor_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    }
}, {
    tableName: 'tourism_trends',
    timestamps: false,
});

module.exports = TourismTrend;
