import { NextFunction, Request, Response } from 'express';
import { CreateAccessGroupDto } from '@dtos/accessGroup.dto';
import { AccessGroup } from '@interfaces/accessGroup.interface';
import AccessGroupService from '@services/accessGroup.service';

class AccessGroupController {
  public accessGroupService = new AccessGroupService();


  public getAccessGroups = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllAccessGroupData: AccessGroup[] = await this.accessGroupService.findAllAccessGroup();
      res.status(200).json({ data: findAllAccessGroupData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };


  public createAccessGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessGroupData: CreateAccessGroupDto = req.body;
      const createAccessGroupData: AccessGroup = await this.accessGroupService.createAccessGroup(accessGroupData);
      res.status(201).json({ data: createAccessGroupData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };


}

export default AccessGroupController;
