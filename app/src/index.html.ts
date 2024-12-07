import { Request, Response } from "express";

import { JobDetailType, SkillAbbrType, UserInformationType } from "./sql-helper";

export function renderLoginPageHTML(req: Request, res: Response) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Job-Seeker</title>
    </head>
    <body>
      <h1>Welcome to Job-Seeker! Please log in.</h1>
    </body>

    <form id="login-form">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required />
        <br><br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required />
        <br><br>
        <button type="button" onclick="handleLogin()">Login</button>
      </form>

    <script>
        async function handleLogin() {
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;

          const response = await fetch('/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          const result = await response.json();
          if (result.success) {
            // Redirect to another page
            window.location.href = result.redirect;
            } else {
            // Alert the user about invalid credentials
            alert(result.message);
            }
        }
      </script>
    </html>
  `;
  res.send(htmlContent);
}

export function renderDashboard(
  req: Request,
  res: Response,
  userInformation: UserInformationType
) {
  const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dashboard</title>
      </head>
      <body>
        <h1>Welcome to the Dashboard, ${userInformation.username}!</h1>
        <p>This is a protected page accessible only after login.</p>
        <a href="/">Go back to login</a><br>
        <a href="/skills">Manage skills</a><br>
        <a href="/search">Search for jobs</a><br>
        <a href="/matching">Jobs I am qualified for</a>
      </body>
      </html>
    `;
  res.send(htmlContent);
}

export function renderSkillsHTML(req: Request, res: Response) {
  const htmlContent = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Skill Management</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        min-height: 100vh;
        margin: 0;
        padding: 20px;
        background-color: #f9f9f9;
      }
      .container {
        display: flex;
        gap: 20px;
      }
      .panel {
        width: 300px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #fff;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }
      .panel-header {
        background-color: #007bff;
        color: #fff;
        padding: 10px;
        font-weight: bold;
        text-align: center;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
      }
      .panel-content {
        padding: 10px;
        max-height: 400px;
        overflow-y: auto;
      }
      .skill-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 10px;
        border-bottom: 1px solid #eee;
      }
      .skill-item:last-child {
        border-bottom: none;
      }
      .button {
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 3px;
        padding: 5px 10px;
        cursor: pointer;
      }
      .button:hover {
        background-color: #0056b3;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Panel 1: Skills the user has -->
      <div class="panel" id="panel1">
        <div class="panel-header">Skills You Have</div>
        <div class="panel-content" id="skillsUserHas">
          <!-- Skills dynamically populated here -->
        </div>
      </div>

      <!-- Panel 2: Skills the user doesn't have -->
      <div class="panel" id="panel2">
        <div class="panel-header">Skills You Don't Have</div>
        <div class="panel-content" id="skillsUserDoesNotHave">
          <!-- Skills dynamically populated here -->
        </div>
      </div>
    </div>

    <script src="js/skills.js"></script>
  </body>
  </html>`;
  res.send(htmlContent);
}

export function renderSearchHTML(req: Request, res: Response) {
  const htmlContent = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Search for a job</title>
    <style>
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
      }
      th {
        background-color: #f2f2f2;
      }
    </style>
  </head>
  <body>
    <form id="search-form">
      <label for="min-salary">Minimum salary:</label>
      <input type="number" id="min-salary" name="min-salary"/>
      <br><br>
      <label for="max-salary">Maximum salary:</label>
      <input type="number" id="max-salary" name="max-salary"/>
      <br><br>
      <button type="button" onclick="handleSearch()">Search</button>
    </form>
    <br>
    <table id="postingsTable">
      <thead>
        <tr>
          <th>Job posting ID</th>
          <th>Job posting title</th>
          <th>Job posting description</th>
          <th>Company name</th>
        </tr>
      </thead>
      <tbody>
        <!-- Rows will be populated dynamically -->
      </tbody>
    </table>
    <script>
      async function handleSearch() {
        const minsal = document.getElementById('min-salary').value;
        const maxsal = document.getElementById('max-salary').value;

        const response = await fetch('/searching', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ minsal, maxsal }),
        });
        const result = await response.json();
        populateTable(result);
      }

      function populateTable(postings) {
        const tableBody = document.querySelector("#postingsTable tbody");
        tableBody.innerHTML = ""; // Clear existing rows

        postings.forEach((posting) => {
          const row = document.createElement("tr");
          row.innerHTML = \`
            <td><a href="/detail/\${posting.posting_id}">\${posting.posting_id}</a></td>
            <td>\${posting.posting_title}</td>
            <td>\${posting.posting_description}</td>
            <td>\${posting.company_name}</td>
          \`;
          tableBody.appendChild(row);
        });
      }
    </script>
  </body>
  </html>`;
  res.send(htmlContent);
}

export function renderDetailHTML(req: Request, res: Response, detail: JobDetailType, skills: SkillAbbrType[]) {
  let skill_str = '';
  skills.forEach((skill) => {skill_str += skill.skill_abbr;skill_str += ' ';})
  const htmlContent = `
  <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Posting details</title>
      <link rel="stylesheet" href="/public/ui4.css">
    </head>
    <body>
      <!-- Header -->
      <header>
        <div class="header-content">
          <h1>Posting details</h1>
        </div>
      </header>

      <!-- Main content -->
      <main>
        <section class="career-details">
          <h2>${detail.posting_title}</h2> <!-- Career Title Above White Box -->     
          <div class="career-info">
            <h3>Posting descriptions:</h3>
            ${detail.posting_description}
            <br>

            <h3>Company name:</h3>
            ${detail.company_name}
            <br>

            <h3>Company descriptions:</h3>
            ${detail.company_description}
            <br>

            <h3>Median salary:</h3>
            ${detail.med_salary}
            <br>

            <h3>Required skills:</h3>
            ${skill_str}
          </div>
        </section>
      </main>
    </body>
    </html>`;
  res.send(htmlContent);
}