export interface IResolutionAction {
  resolutionActionKey: number;
  resolutionActionId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  resolutionActionName: string;
  resolutionActionDescription: string;
  sudoryTemplateKey: number;
  resolutionActionTemplateSteps: JSON;
  resolutionActionType: string; //MO - metricOps only, IA - metricOps + incidentAction
  resolutionActionPrerequisiteKey: number;
  customerAccountKey: number;
}
