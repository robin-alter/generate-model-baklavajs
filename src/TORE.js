
/* eslint-disable */
//TORE Categories
const STAKEHOLDER_GOAL = "Stakeholder Goal";
const STAKEHOLDER_TASK = "Stakeholder Task";
const SUPPORTED_STAKEHOLDER = "Supported Stakeholder";
const DOMAIN_DATA = "Domain Data";
const INTERACTION_DATA = "Interaction Data";
const SYSTEM_FUNCTION = "System Function";
const WORKSPACE = "Workspace";
const SOFTWARE = "Software";
const INTERNAL_DATA = "Internal Data";

//TORE Relationships 
const COMMUNICATES_WITH = "communicates with";
const EXCHANGES_WITH = "exchanges with";
const WORKS_WITH = "works with";
const INPUTS = "inputs";
const ACCESSES = "accesses";
const SELECTS = "selects";
const UTILIZES = "utilizes";
const USES = "uses";
const OUTPUTS = "outputs";
const ARRANGES = "arranges";
const PROVIDES = "provides";
const PROCESSES = "processes";

export const tore_codes = [
    STAKEHOLDER_GOAL,
    STAKEHOLDER_TASK,
    SUPPORTED_STAKEHOLDER,
    DOMAIN_DATA,
    INTERACTION_DATA,
    SYSTEM_FUNCTION,
    WORKSPACE,
    SOFTWARE,
    INTERNAL_DATA
]

export const tore_relationships = {
    [COMMUNICATES_WITH]: [SUPPORTED_STAKEHOLDER, SUPPORTED_STAKEHOLDER],
    [EXCHANGES_WITH]: [SUPPORTED_STAKEHOLDER, SUPPORTED_STAKEHOLDER],
    [WORKS_WITH]: [SUPPORTED_STAKEHOLDER, DOMAIN_DATA],
    [INPUTS]: [SUPPORTED_STAKEHOLDER, INTERACTION_DATA],
    [ACCESSES]: [SUPPORTED_STAKEHOLDER, INTERACTION_DATA],
    [SELECTS]: [SUPPORTED_STAKEHOLDER, WORKSPACE],
    [UTILIZES]: [SUPPORTED_STAKEHOLDER, SYSTEM_FUNCTION],
    [USES]: [SUPPORTED_STAKEHOLDER, SOFTWARE],
    [OUTPUTS]: [SOFTWARE, INTERACTION_DATA],
    [ARRANGES]: [SOFTWARE, WORKSPACE],
    [PROVIDES]: [SOFTWARE, SYSTEM_FUNCTION],
    [PROCESSES]: [SOFTWARE,INTERNAL_DATA]
}
