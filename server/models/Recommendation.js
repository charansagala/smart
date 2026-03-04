const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Recommendation = sequelize.define('Recommendation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    destination_id: { type: DataTypes.INTEGER, references: { model: 'destinations', key: 'id' } },
    match_score: { type: DataTypes.INTEGER, defaultValue: 80 },
    budget_category: { type: DataTypes.ENUM('Budget', 'Mid-range', 'Luxury'), defaultValue: 'Mid-range' },
    interests: { type: DataTypes.JSON },
    reason: { type: DataTypes.TEXT },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'recommendations' });

module.exports = Recommendation;
