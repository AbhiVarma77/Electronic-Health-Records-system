import React from 'react';
import { useQuery } from '@tanstack/react-query';
//
import styles from './patient.module.css';
//
import Button from '../../components/Button';
import Message from '../../components/Message';
import TextInput from '../../components/TextInput';
import PatientList from '../../components/PatientList';
//
import { getPatients } from '../../utils/api';
import { Link, useSearchParams } from 'react-router-dom';

const SearchPatient = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  console.log(searchParams);
  const text = searchParams.get('q') || '';

  const { data, error } = useQuery({
    queryKey: ['getPatient', text],
    queryFn: () => getPatients(text),
    enabled: text !== '',
  });

  const handleText = (e) => {
    setSearchParams({ q: e.target.value });
  };

  return (
    <div className="container">
      <h1 className={styles.title}>Search existing patients</h1>
      <div className={styles['search-wrp']}>
        <div className="row">
          <p>Enter Patient Book number / Phone number</p>
          <TextInput
            placeholder="Book Number"
            containerStyles={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0px',
            }}
            inputStyles={{ margin: '0px' }}
            value={text}
            onChange={(e) => handleText(e)}
          />
        </div>
      </div>

      {error && <Message type={'fail'} message={error.message} />}

      {data &&
        (data?.length === 0 ? (
          <div className="">
            <Message type={'fail'} message={'No patient found'} />
            <Link className={styles.link} to="/patient/register">
              <Button title="Create patient" />
            </Link>
          </div>
        ) : (
          <Message type={'info'} message={`${data.length} patients found`} />
        ))}

      <div className="my-4">
        {/* TODO : patients list [table] - name | phone | bookNumber */}
        {data?.length > 0 && <PatientList patients={data} />}
      </div>
    </div>
  );
};

export default SearchPatient;
