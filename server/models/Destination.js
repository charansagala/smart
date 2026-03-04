const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Destination = sequelize.define(
    'Destination',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate: { notEmpty: true, len: [2, 200] },
        },
        location: {
            type: DataTypes.STRING(300),
            allowNull: false,
            comment: 'City, Country or region',
        },
        rating: {
            type: DataTypes.DECIMAL(3, 2),
            defaultValue: 4.0,
            validate: { min: 0, max: 5 },
        },
        popularity_score: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Computed visit count / engagement score',
        },
        best_season: {
            type: DataTypes.ENUM('Spring', 'Summer', 'Autumn', 'Winter', 'Year-round'),
            defaultValue: 'Year-round',
        },
        cost_level: {
            type: DataTypes.ENUM('Budget', 'Mid-range', 'Luxury'),
            defaultValue: 'Mid-range',
        },
        category: {
            type: DataTypes.ENUM('Beach', 'Mountain', 'City', 'Nature', 'Cultural', 'Adventure'),
            defaultValue: 'Cultural',
        },
        description: {
            type: DataTypes.TEXT,
        },
        attributes: {
            type: DataTypes.JSON,
            defaultValue: [],
            comment: 'Array of string tags e.g. ["Hiking", "UNESCO", "Beaches"]',
        },
        image_url: {
            type: DataTypes.STRING(1000),
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: 'destinations',
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ['name'] },
            { fields: ['category'] },
            { fields: ['best_season'] },
            { fields: ['cost_level'] },
            { fields: ['rating'] },
        ],
    }
);

module.exports = Destination;
