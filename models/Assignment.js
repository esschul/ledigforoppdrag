const ROLES = require("./Roles").ROLES;
const SKILLS = require("./Skills").SKILLS;


class Assignment {
    constructor(published = false, company = "", deadline, location = "", description = "", skills = [], roles = [], buzzWords = []) {
        this.published = published;
        this.company = company;
        this.deadline = deadline;
        this.description = description;
        this.profileDate = profileDate;
        let allSkills = SKILLS;
        allSkills.forEach(function (skill) {
            if (skills && skills.indexOf(skill) !== -1) {
                skill.checked = true;
            }
        });

        this.skills = allSkills;
        let allRoles = ROLES;
        allRoles.forEach(function (role) {
            if (roles && roles.indexOf(role) !== -1) {
                role.checked = true;
            }
        });
        this.roles = allRoles;
        this.buzzWords = buzzWords;
    }
}

module.exports = {
    Assignment
};