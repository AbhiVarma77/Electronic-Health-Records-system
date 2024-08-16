import React from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import TextInput from "../../components/TextInput";
import { useState, useEffect } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { getPatientByBookNumber, setQrToPatient } from "../../utils/api";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
export default function FreshQRPage() {
  const navigate = useNavigate();
  const qrId = useParams().qrId;
  const [bookNumber, setBookNumber] = useState("");
  const debouncedBookNumber = useDebounce(bookNumber, 1000);

  const [patient, setPatient] = useState();
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const search = async () => {
      if (debouncedBookNumber) {
        setLoading(true);
        const data = await getPatientByBookNumber(debouncedBookNumber, {
          signal: abortController.signal,
        });
        setLoading(false);
        setPatient(data);
      }
    };
    search();
    return () => {
      abortController.abort();
    };
  }, [debouncedBookNumber]);

  const mapUserToQr = async () => {
    console.log("on click")
    setLoading(true);
    await setQrToPatient({
      qrId, patientId: patient.id
    })
    navigate(`/patient/${patient.id}`)
  }

  return (
    <div className="container">
      <h1>Fresh QR Code detected.</h1>
      <p>
        <Link to={`/patient/register/?qr-id=${encodeURIComponent(qrId)}`}>
          Create a new patient
        </Link>{" "}
        or map it to an existing user.
      </p>
      <div className="container">
        <TextInput
          placeholder="Book Number"
          containerStyles={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0px",
          }}
          inputStyles={{ margin: "0px" }}
          value={bookNumber}
          onChange={(e) => {
            setBookNumber(e.target.value);
          }}
        />
      </div>
      {
        patient && (<div key={patient.id} className="d-flex flex-column border p-2 mb-2">
          <div className="">Book Number: {patient.bookNumber}</div>
          <div className="">Name: {patient.name}</div>
          <div className="">Phone Number: {patient.phone}</div>
          <Button
            type="button"
            title="Assign QR ID"
            onClick={mapUserToQr}
            disabled={isLoading}
          />
          </div>
        )
      }
    </div>
  );
}