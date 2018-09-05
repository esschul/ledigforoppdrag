const ROLES = require("./Roles").ROLES;
const SKILLS = require("./Skills").SKILLS;

class Profile {
    constructor(linkedinProfile, profileDate, wishes = "", skills = [], roles = []) {
        this.linkedinProfile = linkedinProfile;
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
        this.wishes = wishes;
    }
}

module.exports = {
    Profile
};