import { pharmacologyData } from './topics/pharmacology';
import { autonomicNervousSystemData } from './topics/autonomicNervousSystem';
import { centralNervousSystemData } from './topics/centralNervousSystem';
import { cardiovascularSystemData } from './topics/cardiovascularSystem';
import { respiratorySystemData } from './topics/respiratorySystem';
import { autacoidsData } from './topics/autacoids';

export const QUESTION_BANK_DATA = {
  pharmacology: {
    name: "Pharmacology",
    subtopics: {
      "general-pharmacology": pharmacologyData.subtopics["general-pharmacology"],
      "autonomic-nervous-system": autonomicNervousSystemData.subtopics,
      "central-nervous-system": centralNervousSystemData.subtopics,
      "cardiovascular-system": cardiovascularSystemData.subtopics,
      "respiratory-system": respiratorySystemData.subtopics,
      "autacoids": autacoidsData.subtopics
    }
  }
};