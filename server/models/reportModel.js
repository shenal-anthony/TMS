const pool = require("../db");

// report_id, generated_date, start_date, end_date, comment, report_data,report_type, user_id, role (for super admin)

// create report
const createReport = async (reportDetails) => {
  const {
    generatedDate,
    startDate,
    endDate,
    comment,
    reportData,
    reportType,
    userId,
    role,
  } = reportDetails;

  const query = `
    INSERT INTO reports 
    (generated_date, start_date, end_date, comment, report_data, report_type, user_id, role)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    generatedDate,
    startDate,
    endDate,
    comment,
    reportData,
    reportType,
    userId,
    role,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// get all reports
const getAllReports = async () => {
  const query = `SELECT * FROM reports`;
  const result = await pool.query(query);
  return result.rows;
};

// get report by user id
const getReportByUserId = async (id) => {
  const query = `SELECT * FROM reports WHERE user_id = $1`;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// get report by report id
const getReportById = async (id) => {
  const query = `SELECT * FROM reports WHERE report_id = $1`;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// get reports by user id
const getReportsByRole = async (role) => {
  const query = `SELECT * FROM reports WHERE role = $1`;
  const values = [role];
  const result = await pool.query(query, values);
  return result.rows;
};

// get reports by date
// const

module.exports = {
  createReport,
  getAllReports,
  getReportsByRole,
  getReportByUserId,
  getReportById,
};
