const properties = require('./json/properties.json');
const users = require('./json/users.json');

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

 const { Pool } = require('pg');

 const pool = new Pool({
   user: 'vagrant',
   password: '123',
   host: 'localhost',
   database: 'lightbnb'
 });

const getUserWithEmail = function(email) {
  // let user;
  // for (const userId in users) {
  //   user = users[userId];
  //   if (user.email.toLowerCase() === email.toLowerCase()) {
  //     break;
  //   } else {
  //     user = null;
  //   }
  // }
  // console.log(user);
  // return Promise.resolve(user);
  

  const values = [email];
  return pool.query(`SELECT * FROM users WHERE email = $1;`, values)
  .then(res => {
    console.log(res.rows);
    return res.rows[0];
  })
  .catch((err) => {
    console.log("Our error", err);
    return err;      
  });
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  // return Promise.resolve(users[id]);


  const values = [id];
  return pool.query(`SELECT * FROM users WHERE id = $1;`, values)
  .then(res => res.rows[0])
  .catch((err) => {
    console.log("Our error in getuserwithid", err);
    return err;      
  });


}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  // const userId = Object.keys(users).length + 1;
  // user.id = userId;
  // users[userId] = user;
  // return Promise.resolve(user);

  const values = [user.name, user.email, '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.'];
  console.log("values", values);
  return pool.query(`INSERT INTO users(name, email, password) Values ($1, $2, $3) RETURNING *`, values)
  .then(res => (res.rows[0]))
  .catch((err) => {
    return err;      
  });




}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 15) {
  // return getAllProperties(null, 2);

    return pool
      .query(`SELECT * FROM properties JOIN reservations ON properties.id = reservations.property_id where guest_id = $1 LIMIT $2`, [guest_id, limit])
      .then(res => res.rows)
      .catch((err) => {
        console.log(err.message);
      });

}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
 const getAllProperties = (options, limit = 7) => {
  // return pool
  //   .query(`SELECT * FROM properties LIMIT $1`, [limit])
  //   .then(res => res.rows)
  //   .catch((err) => {
  //     console.log(err.message);
  //   });

  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  WHERE city IS NOT NULL
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `AND city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    queryString += `AND owner_id LIKE $${queryParams.length} `;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night * 100}`);
    queryString += `AND cost_per_night >= $${queryParams.length} `;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night * 100}`);
    queryString += `AND cost_per_night <= $${queryParams.length} `;
  }

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += `AND rating >= $${queryParams.length} `;
  }
  
  // 4
  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams).then((res) => res.rows);






};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  // const propertyId = Object.keys(properties).length + 1;
  // property.id = propertyId;
  // properties[propertyId] = property;
  // return Promise.resolve(property);


  // const values = [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms];
  // // const values = [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, Number(property.cost_per_night), property.street, property.city, property.province, property.post_code, property.country, Number(property.parking_spaces), Number(property.number_of_bathrooms), Number(property.number_of_bedrooms)];
  // console.log("values", values);

  // return pool.query(`INSERT INTO properties(owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) Values ($1, $2, $3, $4, $5, $6, $7, $8, $9, #10, $11, $12, $13, $14) RETURNING *`, values)
  // // return pool.query("INSERT INTO properties(owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) Values (1000, 'Mtitle', 'Mdesc', 'qqqqq','wwwww', 30, '3', 'Montral', 'QB', 'll44ff', 'canada', 2,3,4 ) RETURNING *")
  // .then(res => console.log("success"))
  // .catch((err) => {
  //   console.log("some error", err.message);       
  // });


  return pool
  .query("INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *", 
  [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms])
  .then((result) => {
    return result.rows[0];
  })
  .catch((err) => {
    return null;
  });


}
exports.addProperty = addProperty;
