import React from 'react';
import { Vendor } from 'types/vendor';
import CreatorStorePage from '@modules/vendorCreator/components/CreatorStorePage';

type VendorTemplateProps = {
  vendor: Vendor,
  
}

const VendorTemplate = ({ vendor, region }: VendorTemplateProps) => {
  // Simply pass the vendor to the CreatorStorePage component
  return <CreatorStorePage vendor={vendor} region={region} />;
};

export default VendorTemplate;