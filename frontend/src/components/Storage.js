// import React from 'react';
// // import * as IPFS from 'ipfs-core'
// import { create } from 'kubo-rpc-client'
// import { ethers } from 'ethers';

// import Artifact from '../contracts/Storage.json';
// import contractAddress from '../contracts/contract-address.json';

// import { Loading } from './Loading';

// import all from 'it-all'
// import { concat } from 'uint8arrays/concat'


// /**
//  * A component that implements the basic logic of image manipulation
//  * and provides a div with this functionality.
//  */
// export class Storage extends React.Component {
//     constructor(props) {
//         super(props);

//         this.initialState = {
//             file: null,
//             image: null,
//             url: null,
//             node: undefined
//         };
//         this.state = this.initialState;

//         this._provider = new ethers.providers.JsonRpcBatchProvider("http://127.0.0.1:8545/");
//         this._contract = new ethers.Contract(
//             contractAddress.Storage,
//             Artifact.abi,
//             this._provider.getSigner('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
//         )

//         this._nodeBeingCreated = false;

//         this._handleFile = this._handleFile.bind(this);
//         this._removeFile = this._removeFile.bind(this);

//         this._uploadCallback = this._uploadCallback.bind(this);
//         this._downloadCallback = this._downloadCallback.bind(this);
//     }

//     render() {
//         if (!this._nodeReady()) {
//             this._prepareIpfsClient();
//             return <Loading />;
//         }
//         if (this._fileUploaded()) {
//             return (
//                 <div className='file-upload'>
//                     <button className='file-upload-btn' type='button' onClick={this._uploadCallback}>Upload</button>
//                     <div className='file-upload-content'>
//                         <img className='file-upload-image' src={this.state.url} alt='' />
//                         <div className='image-title-wrap'>
//                             <button type='button' onClick={this._removeFile} className='remove-image'>
//                                 Remove
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )
//         }
//         if (this._fileDownloaded()) {
//             return (
//                 <div className='file-upload'>
//                     <div className='file-upload-content'>
//                         <button className='remove-downloaded-btn' type='button' onClick={this._removeFile}>Remove</button>
//                         <img className='file-upload-image' src={this.state.image} alt='' />
//                     </div>
//                 </div>
//             )
//         }
//         return (
//             <div className='file-upload'>
//                 <button className='file-upload-btn' type='button' onClick={this._downloadCallback}>Download</button>
//                 <div className='image-upload-wrap'>
//                     <input className='file-upload-input' type='file' onChange={this._handleFile} accept='image/png' />
//                     <div className='drag-text'>
//                         <h3>Drag and drop a file or select PNG Image from computer</h3>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     async _handleFile(event) {
//         this.setState({
//             file: event.target.files[0],
//             url: await this._readDataUrlAsync(event.target.files[0])
//         });
//     }

//     async _readDataUrlAsync(file) {
//         return new Promise((resolve, reject) => {
//             let reader = new FileReader();
//             reader.onload = () => {
//                 resolve(reader.result);
//             }
//             reader.onerror = reject;
//             reader.readAsDataURL(file);
//         });
//     }

//     _removeFile() {
//         this.setState({
//             file: null,
//             url: null,
//             image: null,
//         })
//     }

//     async _uploadCallback() {
//         const cid = await this._uploadFile(this.state.file);
//         await this._contract.setFile(cid.toString());
//         this._removeFile();
//     }

//     // async _uploadFile(file) {
//     //     const content = await this._readFileAsync(file);
//     //     const result = await this.state.node.add(content);
//     //     return result.cid;
//     // }

//     async _uploadFile(file) {
//         const content = await this._readFileAsync(file);     // ArrayBuffer
//         const result = await this.state.node.add(new Uint8Array(content));
//         return result.cid;
//     }

//     async _downloadCallback() {
//         const cid = await this._contract.getFile();

//         const generator = this.state.node.cat(cid);
//         const packets = await all(generator);
//         const bytes = concat(packets);

//         const image = new Blob([bytes.buffer], { type: "image/png" });
//         const url = window.URL.createObjectURL(image);
//         this.setState({ file: null, url: null, image: url })
//     }

//     async _readFileAsync(file) {
//         return new Promise((resolve, reject) => {
//             let reader = new FileReader();
//             reader.onload = () => {
//                 resolve(reader.result);
//             };
//             reader.onerror = reject;
//             reader.readAsArrayBuffer(file);
//         })
//     }

//     _nodeReady() {
//         return this.state.node !== undefined;
//     }

//     _prepareIpfsClient() {
//         if (this._nodeBeingCreated) {
//             return;
//         }
//         this._nodeBeingCreated = true;
//         this._createIpfsClient();
//     }

//     // async _createIpfsClient() {
//     //     this.setState({
//     //         node: await IPFS.create()
//     //     });
//     // }

//     async _createIpfsClient() {
//     // Подключаемся к IPFS Desktop (Kubo) по HTTP API
//     const node = create({ url: "http://127.0.0.1:5001/api/v0" });

//     this.setState({ node });
// }


//     _fileUploaded() {
//         return this.state.file !== null;
//     }

//     _fileDownloaded() {
//         return this.state.image !== null;
//     }
// }
import React, { useEffect, useMemo, useState } from "react";
import { create as createIpfsClient } from "kubo-rpc-client";
import { ethers } from "ethers";

import Artifact from "../contracts/Storage.json";
import contractAddress from "../contracts/contract-address.json";

const IPFS_API = "http://127.0.0.1:5001/api/v0";
const IPFS_GATEWAY = "http://127.0.0.1:8080";

function toGatewayUrl(cid) {
  return `${IPFS_GATEWAY}/ipfs/${cid}`;
}

export function Storage() {
  const ipfs = useMemo(() => createIpfsClient({ url: IPFS_API }), []);
  const provider = useMemo(
    () => new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545"),
    []
  );
  const signer = useMemo(() => provider.getSigner(0), [provider]);

  const contract = useMemo(() => {
    return new ethers.Contract(contractAddress.Storage, Artifact.abi, signer);
  }, [signer]);

  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);

  const [pickedFile, setPickedFile] = useState(null);
  const [pickedPreview, setPickedPreview] = useState(null);

  const [previewCid, setPreviewCid] = useState(null);

  async function refresh() {
    const list = await contract.getFiles();
    // list = array of tuples/structs: {cid,name,createdAt,deleted}
    setFiles(
      list.map((x) => ({
        cid: x.cid,
        name: x.name,
        createdAt: Number(x.createdAt),
        deleted: x.deleted,
      }))
    );
  }

  useEffect(() => {
    refresh().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onPickFile(e) {
    const f = e.target.files?.[0] || null;
    setPickedFile(f);
    setPreviewCid(null);

    if (pickedPreview) URL.revokeObjectURL(pickedPreview);
    setPickedPreview(f ? URL.createObjectURL(f) : null);
  }

  async function onUpload() {
    if (!pickedFile) return;
    setBusy(true);
    try {
      // 1) грузим в IPFS Desktop
      const added = await ipfs.add(pickedFile);
      const cid = added.cid.toString();

      // 2) пинаем, чтобы у тебя локально не пропало
      await ipfs.pin.add(added.cid);

      // 3) записываем в контракт (история)
      const tx = await contract.addFile(cid, pickedFile.name || "image.png");
      await tx.wait();

      // 4) обновляем список + чистим форму
      await refresh();
      setPickedFile(null);
      if (pickedPreview) URL.revokeObjectURL(pickedPreview);
      setPickedPreview(null);
    } finally {
      setBusy(false);
    }
  }

//   async function onDelete(index) {
//     setBusy(true);
//     try {
//       const tx = await contract.deleteFile(index);
//       await tx.wait();

//       // (опционально) можно unpin, если хочешь реально убрать локально:
//       // const cid = files[index]?.cid;
//       // if (cid) await ipfs.pin.rm(cid);

//       await refresh();
//     } finally {
//       setBusy(false);
//     }
//   }

async function onDelete(index) {
  setBusy(true);
  try {
    const cid = files[index]?.cid;

    const tx = await contract.deleteFile(index);
    await tx.wait();

    if (previewCid === cid) setPreviewCid(null);

    try {
      if (cid) await ipfs.pin.rm(cid);
    } catch (_) {}

    await refresh();
  } finally {
    setBusy(false);
  }
}


  async function onRestore(index) {
    setBusy(true);
    try {
      const tx = await contract.restoreFile(index);
      await tx.wait();
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  function onView(cid) {
    setPreviewCid(cid);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>IPFS Drive (History)</h2>

      {/* Upload block */}
      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <h3>Upload</h3>

        <input type="file" accept="image/*" onChange={onPickFile} />
        <div style={{ marginTop: 12 }}>
          <button type="button" onClick={onUpload} disabled={!pickedFile || busy}>
            {busy ? "Working..." : "Upload to IPFS + Save to blockchain"}
          </button>
          <button
            type="button"
            onClick={() => {
              setPickedFile(null);
              if (pickedPreview) URL.revokeObjectURL(pickedPreview);
              setPickedPreview(null);
            }}
            disabled={busy}
            style={{ marginLeft: 8 }}
          >
            Clear
          </button>
        </div>

        {pickedPreview && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Preview:</div>
            <img src={pickedPreview} alt="" style={{ maxWidth: 260, borderRadius: 12 }} />
          </div>
        )}
      </div>

      {/* Preview block */}
      {previewCid && (
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <h3>Preview from IPFS</h3>
          <div style={{ fontSize: 12, opacity: 0.7, wordBreak: "break-all" }}>{previewCid}</div>
          <div style={{ marginTop: 12 }}>
            <img src={toGatewayUrl(previewCid)} alt="" style={{ maxWidth: "100%", borderRadius: 12 }} />
          </div>
          <div style={{ marginTop: 12 }}>
            <a href={toGatewayUrl(previewCid)} target="_blank" rel="noreferrer">
              Open in new tab
            </a>
          </div>
        </div>
      )}

      {/* History list */}
      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <h3>My files</h3>

        <button type="button" onClick={() => refresh()} disabled={busy}>
          Refresh list
        </button>

        {files.length === 0 ? (
          <div style={{ marginTop: 12, opacity: 0.7 }}>No files yet.</div>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {files.map((f, idx) => (
              <div
                key={`${f.cid}-${idx}`}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 12,
                  opacity: f.deleted ? 0.5 : 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>
                      #{idx} — {f.name || "(no name)"} {f.deleted ? "(deleted)" : ""}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      CID: <span style={{ wordBreak: "break-all" }}>{f.cid}</span>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      Created: {f.createdAt ? new Date(f.createdAt * 1000).toLocaleString() : "-"}
                    </div>
                  </div>

<div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
  {!f.deleted ? (
    <>
      <button type="button" onClick={() => onView(f.cid)} disabled={busy}>
        View
      </button>
      <button type="button" onClick={() => onDelete(idx)} disabled={busy}>
        Delete
      </button>
    </>
  ) : (
    <button type="button" onClick={() => onRestore(idx)} disabled={busy}>
      Restore
    </button>
  )}
</div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
