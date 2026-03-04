const Destination = require('./Destination');
const Trip = require('./Trip');
const Recommendation = require('./Recommendation');

// Associations
Trip.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });
Destination.hasMany(Trip, { foreignKey: 'destination_id', as: 'trips' });

Recommendation.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });
Destination.hasMany(Recommendation, { foreignKey: 'destination_id', as: 'recommendations' });

module.exports = { Destination, Trip, Recommendation };
