import express, { Request, Response, NextFunction, application } from "express";
import session from "express-session";
import asyncHandler from "express-async-handler";
import path from "path";

import {
  renderLoginPageHTML,
  renderDashboard,
  renderSkillsHTML,
  renderSearchHTML,
  renderDetailHTML,
} from "./index.html";
import {
  verifyLogin,
  UserInformationType,
  getAllSkills,
  getUserSkills,
  addUserSkill,
  removeUserSkill,
  searchJobPosting,
  getMatchingJobs,
  getPostingSkills,
  getPostingDetail,
} from "./sql-helper";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/public", express.static(path.join(__dirname, "public")));

declare module "express-session" {
  interface SessionData {
    userInformation: UserInformationType;
  }
}
app.use(
  session({
    secret: "your_secret_key", // Use an environment variable for production
    resave: false,
    saveUninitialized: true,
  })
);

// Main page
app.get("/", renderLoginPageHTML);

// Handle login form submission
app.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const verifyResult = await verifyLogin(username, password);
    if (verifyResult.length) {
      req.session.userInformation = verifyResult[0];
      res.json({ success: true, redirect: "/dashboard" });
    } else {
      res.json({ success: false, message: "Invalid username or password." });
    }
  })
);

// Handle job search
app.post(
  "/searching",
  asyncHandler(async (req: Request, res: Response) => {
    let { minsal, maxsal } = req.body;
    if (!minsal) {
      minsal = 0;
    }
    if (!maxsal) {
      maxsal = 1e30;
    }
    const searchResult = await searchJobPosting(minsal, maxsal);
    res.json(searchResult[0]);
  })
);

// Handle skill addition
app.post(
  "/skills/add",
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.session.userInformation) {
      throw new Error("User information not defined");
    }
    const skill = req.body;
    await addUserSkill(req.session.userInformation.user_id, skill.skill);
    res.json({ ok: true });
  })
);

// Handle skill removing
app.post(
  "/skills/remove",
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.session.userInformation) {
      throw new Error("User information not defined");
    }
    const skill = req.body;
    await removeUserSkill(req.session.userInformation.user_id, skill.skill);
    res.json({ ok: true });
  })
);

app.get("/dashboard", (req, res) => {
  if (!req.session.userInformation) {
    throw new Error("User information not defined");
  }
  renderDashboard(req, res, req.session.userInformation);
});

app.get("/skills", (req, res) => {
  renderSkillsHTML(req, res);
});

app.get(
  "/search",
  // asyncHandler(async (req: Request, res: Response) => {
  //   if (!req.session.userInformation) {
  //     throw new Error("User information not defined");
  //   }
  //   const postingResult = await searchJobPosting(
  //     req.session.userInformation?.user_id
  //   );
  //   console.log(postingResult);
  // })
  (req, res) => {
    renderSearchHTML(req, res);
  }
);

app.get(
  "/detail/:posting_id",
  asyncHandler(async (req: Request, res: Response) => {
    const posting_id = Number(req.params.posting_id);
    const skills = await getPostingSkills(posting_id);
    const detail = await getPostingDetail(posting_id);
    renderDetailHTML(req, res, detail[0], skills);
  })
);

app.get("/api/all-skills", async (req: Request, res: Response) => {
  const queryResult = await getAllSkills();
  let allSkills = [];
  for (const skill of queryResult) {
    allSkills.push(skill.skill_abbr);
  }
  res.json({ allSkills });
});

app.get("/api/user-skills", async (req: Request, res: Response) => {
  if (!req.session.userInformation) {
    throw new Error("User information not defined");
  }
  const queryResult = await getUserSkills(req.session.userInformation.user_id);
  let userSkills: string[] = [];
  for (const skill of queryResult) {
    userSkills.push(skill.skill_abbr);
  }
  res.json({ userSkills });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
