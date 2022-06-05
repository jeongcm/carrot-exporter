export interface IMassUploaderMongoUpdateDto{
    resourceTargetUuid: string,
    resourceNamespace: string,
    resourceInstance: string,
    resourceLabels: JSON,
    resourceAnnotations: JSON,
    resourceSpec: JSON,
    resourceStatus: JSON,
    resourceEndpoint: JSON,
    updatedAt: Date,
}