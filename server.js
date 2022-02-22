var express = require('express');
var app = express();
var port = 3000;
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const cors = require('cors');
var mariadb = require('mariadb');
app.use(express.json());

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'sample',
    port: 3306,
    connectionLimit: 5
});

const options = {
    swaggerDefinition: {
        info: {
            title: 'Week05 Assignment',
            version: '1.0.0',
            description: 'ITIS-6177 Swagger assignment',
        }
    },
    apis: ['server.js'],
};

const specs = swaggerJsdoc(options);
app.use('/data', swaggerUI.serve, swaggerUI.setup(specs));
app.use(cors());

/**
 * @swagger
 * /company:
 *     get:
 *       description: Fetch all companies
 *       produces:
 *            - application/json
 *       responses:
 *           200:
 *              description: return all companies from the company table
 *           500:
 *              description: Internal server error
 *           404:
 *              description: Page Not found
 *
 */

app.get('/company', (req, res) => {
    pool.getConnection()
        .then(conn => {
            conn.query("SELECT * from company")
                .then((rows) => {
                    res.setHeader('Content-Type', 'Application/json');
                    res.json(rows);
                })
        });

});

/**
 * @swagger
 * definitions:
 *  Company:
 *   type: object
 *   properties:
 *    id:
 *     type: string
 *    name:
 *     type: string
 *    City:
 *     type: string
 *  Update_Company:
 *   type: object
 *   properties:
 *    name:
 *     type: string
 *    City:
 *     type: string
 */

/**
 * @swagger
 * /company/{companyid}:
 *  put:
 *   description: create or update record in company table
 *   parameters:
 *    - in: body
 *      name: company
 *      required: true
 *      description:
 *      schema:
 *       $ref: '#/definitions/Company'
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/definitions/Company'
 *   responses:
 *    200:
 *     description: success
 *    500:
 *     description : error
 */

app.put('/company', (req, res) => {
    const { id, name, city } = req.body;
    pool.getConnection()
        .then(conn => {
            conn.query(`select * from company where COMPANY_ID = '${id}'`)
                .then((output) => {
                    if (output.length == 0) {
                        conn.query('INSERT INTO `company` (`COMPANY_ID`, `COMPANY_NAME`, `COMPANY_CITY`) VALUES (?, ?, ?)',
                            [id, name, city])
                            .then((rows) => {
                                console.log(rows);
                                res.setHeader('Content-Type', 'Application/json');
                                res.json(rows);
                            });
                    }
                    else {
                        conn.query(`update company set COMPANY_NAME = '${name}', COMPANY_CITY = '${city}' where COMPANY_ID = '${id}'`)
                            .then((rows) => {
                                res.setHeader('Content-Type', 'Application/json');
                                res.json(rows);
                            });
                    }
                });
        });
});

/**
 * @swagger
 * /company:
 *  post:
 *   description: Insert new record in company table
 *   parameters:
 *    - in: body
 *      name: body
 *      required: true
 *      schema:
 *       $ref: '#/definitions/Company'
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/definitions/Company'
 *   responses:
 *    200:
 *     description: success
 *    500:
 *     description : error
 */


app.post('/company', (req, res) => {
    const { id, name, City } = req.body;

    pool.getConnection()
        .then(conn => {
            conn.query('INSERT INTO `company` (`COMPANY_ID`, `COMPANY_NAME`, `COMPANY_CITY`) VALUES (?, ?, ?)', [id, name, City])
                .then((rows) => {
                    res.setHeader('Content-Type', 'Application/json');
                    res.json(rows);
                })
        });
});

/**
 * @swagger
 * /company/{companyid}:
 *  delete:
 *   summary: delete company
 *   description: delete record from company table
 *   parameters:
 *    - in: path
 *      name: companyid
 *      schema:
 *       type: String
 *      required: true
 *      description: company id
 *   responses:
 *    200:
 *     description: success
 *    500:
 *     description: Internal server error
 */

app.delete('/company/:companyid', (req, res) => {
    const id = req.params.companyid;
    pool.getConnection()
        .then(conn => {
            conn.query(`DELETE FROM company WHERE company_id = '${id}'`)
                .then((rows) => {
                    res.setHeader('Content-Type', 'Application/json');
                    res.json(rows);
                })
        });

});


/**
 * @swagger
 * /company/{companyid}:
 *    patch:
 *      description: Update a record from company table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Updated record from company table
 *      parameters:
 *          - name: companyid
 *            in: path
 *            required: true
 *            type: string
 *          - name: company
 *            description: company object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/Update_Company'
 *
 */

app.patch('/company/:companyid', (req, res) => {

    const id = req.params.companyid
    const { name, City } = req.body;
    pool.getConnection()
        .then(conn => {
            conn.query(`select * from company where company_id = '${id}'`)
            .then((output) => {
                if (output.length == 0) {
                    res.json("Please enter valid one");
                }
                else {

                    if (name && City) {
                        conn.query(`update company set company_name = '${name}', company_city = '${City}' where company_id = '${id}'`)
                            .then((rows) => {
                                console.log(rows);
                                res.setHeader('Content-Type', 'Application/json');
                                res.json(rows);
                            });
                    }

                    if (name && !City) {
                        conn.query(`update company set company_name = '${name}' where company_id = '${id}'`)
                            .then((rows) => {
                                console.log(rows);
                                res.setHeader('Content-Type', 'Application/json');
                                res.json(rows);
                            });
                    }

                    if (City && !name) {
                        conn.query(`update company set company_city = '${City}' where company_id = '${id}'`)
                            .then((rows) => {
                                console.log(rows);
                                res.setHeader('Content-Type', 'Application/json');

                                res.json(rows);
                            });
                    }

                }
            });
        });

});

app.listen(port, () => {
    console.log(` app listening at http://localhost:${port}`)
});