import { bootstrapCameraKit, CameraKitSession, Lens } from "@snap/camera-kit";
import { createContext, useEffect, useRef, useState } from "react";

// const apiToken =
//   "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzQ3Mjg4NzY4LCJzdWIiOiIzMGI2YWI0ZC0yODE0LTRlYmQtYmE1NC0xOTJhM2Q4YjUxYzl-U1RBR0lOR35hMjVjOWRmOC03N2VmLTRhZTUtODlhNi05ODg0ODAyNzU3N2MifQ.cmf4n9Bn4TRzNsgT5uR6kCeG0F-os4V7LTpr4-dkKJg"; //chester
// const apiToken =
//   "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzQ3Mjg4NzY4LCJzdWIiOiIzMGI2YWI0ZC0yODE0LTRlYmQtYmE1NC0xOTJhM2Q4YjUxYzl-UFJPRFVDVElPTn5mOWM4MTY0Zi03NDQ1LTQ5MzMtYjI5MS1iMWQwYzMzZTk4NjUifQ.636ag1IAfVfzrwVYjBLL6gR4CtFMVbwFxJWqIL0F9oE"; //chester-prod
const apiToken =
  "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzQ3Mjk2MDkwLCJzdWIiOiIwNmYzNDAxNS1hMjhmLTQyODUtYWQyOC0wZmFmYjFiMjg5M2N-U1RBR0lOR34yYjVkOTM2Yy0yNDY0LTRhMTUtYThlZS03Mzk1ZGE4ZTY4NjIifQ.wdly3Zqecu9omm_mydM2TcXH8K-GFzpqatnqknGi-As"; //jimi***
// const apiToken =
//   "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzQ3Mjk2MDkwLCJzdWIiOiIwNmYzNDAxNS1hMjhmLTQyODUtYWQyOC0wZmFmYjFiMjg5M2N-UFJPRFVDVElPTn5kZDlmY2ZiOS0xNDliLTRmYTEtYmMyOS0yODc5ZjQ3YWUwY2YifQ.4DCJ8eldekKmL5nFU3taVMTD891o9kU_sHojrPZ6pPc"; //jimi-prod

// const lensGroupId = "39eb0d0a-9374-411a-95e1-63c3b44e2729"; //chester
// const lensGroupId = "cd4c7ba2-f11c-4830-add0-8bfac4aa26b6"; //chester***
// const lensGroupId = "9ad5f7fe-d069-4103-837e-4fee28bdd5af"; //jimi
const lensGroupId = "3fb26319-96cd-41e0-ae70-8a3b9fdf3723"; //jimi***

// const lensId_spe3d = "2f81fd00-196d-49f0-8da4-c540e6367070"; //chester
// const lensId_segmentat = "43300180875"; //chester
export interface CameraKitState {
  session: CameraKitSession;
  lenses: Lens[];
}

export const CameraKitContext = createContext<CameraKitState | null>(null);

export const CameraKit: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isInitialized = useRef<boolean>(false);
  const [session, setSession] = useState<CameraKitSession | null>(null);
  const [lenses, setLenses] = useState<Lens[]>([]);

  useEffect(() => {
    const initializeCameraKit = async () => {
      const cameraKit = await bootstrapCameraKit({ apiToken });
      const session = await cameraKit.createSession();

      // lens 是單一 Lens 物件
      // const lens = await cameraKit.lensRepository.loadLens(
      //   lensId_spe3d,
      //   // lensId_segmentat,
      //   lensGroupId
      // );
      // setLenses([lens]);

      const { lenses } = await cameraKit.lensRepository.loadLensGroups([
        lensGroupId,
      ]);
      console.log(lenses);
      setLenses(lenses);
      setSession(session);
    };

    if (isInitialized.current) return;
    isInitialized.current = true;

    initializeCameraKit();
  }, []);

  return !session ? (
    <div className="w-screen h-[100dvh] flex justify-center items-center">
      Initializing Camera Kit...
    </div>
  ) : (
    <CameraKitContext.Provider value={{ session, lenses }}>
      {children}
    </CameraKitContext.Provider>
  );
};
