import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';

export const StaffOverview = () => {
  return (
    <div className="container">
      <div className="d-flex flex-column">
        <Link className="text-decoration-none" to="/patient/register">
          <Button
            title="New Patient"
            containerStyles={{ width: '100%' }}
            buttonStyles={{ width: '90%' }}
          />
        </Link>
        <Link className="text-decoration-none" to="/patient/search">
          <Button
            title="Existing patient"
            containerStyles={{ width: '100%' }}
            buttonStyles={{ width: '90%' }}
          />
        </Link>
        <Link className="text-decoration-none mt-5 pt-5" to="/vitals">
          <Button
            title="Vitals"
            containerStyles={{ width: '100%', marginTop: '36px' }}
            buttonStyles={{ width: '90%' }}
          />
        </Link>
        <Link className="text-decoration-none" to="/visits">
          <Button
            title="View appointments"
            containerStyles={{ width: '100%' }}
            buttonStyles={{ width: '90%', }}
          />
        </Link>
        <Link className="text-decoration-none" to="/consultations">
          <Button
            disabled={true}
            title="consultations"
            containerStyles={{ width: '100%' }}
            buttonStyles={{ width: '90%', background: 'grey' }}
          />
        </Link>
        <Link className="text-decoration-none" to="/medicines">
          <Button
            disabled={true}
            title="medicines"
            containerStyles={{ width: '100%' }}
            buttonStyles={{ width: '90%', background: 'grey' }}
          />
        </Link>
        <Link className="text-decoration-none" to="/tests">
          <Button
            disabled={true}
            title="tests"
            containerStyles={{ width: '100%' }}
            buttonStyles={{ width: '90%', background: 'grey' }}
          />
        </Link>

        <Link className="text-decoration-none" to="/records">
          <Button
            title="records"
            containerStyles={{ width: '100%' }}
            buttonStyles={{ width: '90%', background: 'grey' }}
          />
        </Link>
      </div>
    </div>
  );
};
