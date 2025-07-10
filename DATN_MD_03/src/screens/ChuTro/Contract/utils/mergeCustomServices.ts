import {CustomService} from '../../../../types';

export const mergeCustomServices = (
  customServicesRom: CustomService[],
  customServicesContent: CustomService[],
): CustomService[] => {
  const updated = customServicesContent.map(contentItem => {
    const exists = customServicesRom.some(
      romItem => romItem._id === contentItem._id,
    );
    return {
      ...contentItem,
      status: exists, // true nếu tồn tại, false nếu không
    };
  });

  return updated;
};
