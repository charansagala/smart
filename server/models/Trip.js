const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Trip = sequelize.define('Trip', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    destination_id: { type: DataTypes.INTEGER, references: { model: 'destinations', key: 'id' } },
    start_date: { type: DataTypes.DATEONLY },
    end_date: { type: DataTypes.DATEONLY },
    budget: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    status: { type: DataTypes.ENUM('Planning', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'), defaultValue: 'Planning' },
    notes: { type: DataTypes.TEXT },
    traveler_count: { type: DataTypes.INTEGER, defaultValue: 1 },
}, { tableName: 'trips' });

module.exports = Trip;
