import mysql, { Connection, RowDataPacket } from "mysql2/promise";

export interface UserInformationType extends RowDataPacket {
  user_id: number;
  username: string;
  password: string;
  age: number;
  state: string;
}

export interface SkillAbbrType extends RowDataPacket {
  skill_abbr: string;
}

export interface PostingInformationType extends RowDataPacket {
  posting_description: string;
  posting_title: string;
  company_name: string;
}

export async function connectToDatabase(): Promise<Connection> {
  const connection = await mysql.createConnection({
    host: "mysql", // Use service name defined in docker-compose.yml
    user: "StillThinking", // MySQL username
    password: "password", // MySQL password
    database: "cs411", // Database name
  });

  return connection;
}

export async function verifyLogin(
  username: string,
  password: string
): Promise<UserInformationType[]> {
  const connection = await connectToDatabase();

  const [rows] = await connection.query<UserInformationType[]>(
    "SELECT * FROM user_information WHERE username = ? AND password = ?",
    [username, password]
  );

  return rows;
}

export async function getAllSkills(): Promise<SkillAbbrType[]> {
  const connection = await connectToDatabase();

  const [rows] = await connection.query<SkillAbbrType[]>(
    "SELECT skill_abbr FROM skills"
  );
  return rows;
}

export async function getUserSkills(user_id: number): Promise<SkillAbbrType[]> {
  const connection = await connectToDatabase();

  const [rows] = await connection.query<SkillAbbrType[]>(
    "SELECT skill_abbr FROM user_skills WHERE user_id = ?",
    [user_id]
  );
  return rows;
}

export async function addUserSkill(
  user_id: number,
  skill_abbr: string
): Promise<void> {
  const connection = await connectToDatabase();

  await connection.query(
    "INSERT INTO user_skills (user_id, skill_abbr) VALUES (?, ?)",
    [user_id, skill_abbr]
  );
}

export async function removeUserSkill(
  user_id: number,
  skill_abbr: string
): Promise<void> {
  const connection = await connectToDatabase();

  await connection.query(
    "DELETE FROM user_skills WHERE user_id = ? AND skill_abbr = ?",
    [user_id, skill_abbr]
  );
}

export async function getMatchingJobs(
  user_id: number
): Promise<PostingInformationType[]> {
  const connection = await connectToDatabase();

  const [rows] = await connection.query<PostingInformationType[]>(
    "CALL GetMatchingPostings(?)",
    [user_id]
  );
  return rows;
}

export async function searchJobPosting(
  min_salary: number,
  max_salary: number
): Promise<PostingInformationType[]> {
  const connection = await connectToDatabase();

  const [rows] = await connection.query<PostingInformationType[]>(
    "CALL SearchForJobs(?, ?)",
    [min_salary, max_salary]
  );
  return rows;
}
