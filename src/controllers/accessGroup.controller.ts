import { NextFunction, Request, Response } from 'express';
import { CreateAccessGroupDto } from '@dtos/accessGroup.dto';
import { AccessGroup } from '@interfaces/accessGroup.interface';
import AccessGroupService from '@services/accessGroup.service';
import { currentUser } from '@/utils/currentUser';

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

  public getAccessGroupById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessGroupId = req.params.id;
      const findOneUserData: AccessGroup = await this.accessGroupService.findAccessGroupById(accessGroupId);
      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public getAccessGroupsByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let currentUserId = currentUser(req).id;
      const findAllAccessGroupData: AccessGroup[] = await this.accessGroupService.findAllAccessGroupByUserId(currentUserId);
      res.status(200).json({ data: findAllAccessGroupData, message: 'findAllById' });
    } catch (error) {
      next(error);
    }
  };


  public createAccessGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessGroupData: CreateAccessGroupDto = req.body;
      let currentUserId = currentUser(req).id;
      const createAccessGroupData: AccessGroup = await this.accessGroupService.createAccessGroup(accessGroupData,currentUserId);
      res.status(201).json({ data: createAccessGroupData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateAccessGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessGroupId = req.params.id;
      const accessGroupData = req.body;
      let currentUserId = currentUser(req).id;
      const updateAccessGroupData: AccessGroup = await this.accessGroupService.updateAccessGroup(accessGroupId, accessGroupData, currentUserId);
      res.status(200).json({ data: updateAccessGroupData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };


}

export default AccessGroupController;
