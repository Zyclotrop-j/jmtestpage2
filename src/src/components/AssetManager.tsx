import React from 'react';
import { DashboardModal   } from '@uppy/react';
import '@uppy/core/dist/style.css'
import '@uppy/drag-drop/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import { observer } from "mobx-react";
import { decorate, observable } from "mobx"
import { Button } from "grommet";
import { newUppy } from "../state/assets";

export default decorate(observer(class AssetManager extends React.Component {
  constructor(props) {
    super(props);
  }

  open = false

  render() {
    const uppy = newUppy(this.props.current.get()?._client, this.props.auth.idToken);
    return <>
      <Button label="Load Assets" disabled={!uppy} onClick={() => {
        this.open = !this.open;
      }} />
      {uppy && <DashboardModal
        metaFields={[
          { id: 'title', name: 'title', placeholder: 'file title' },
          { id: 'description', name: 'description', placeholder: 'describe what the image is about' }
        ]}
        open={this.open}
        closeModalOnClickOutside
        onRequestClose={() => { this.open = false; }}
        uppy={uppy}
        inline={false}
        plugins={["Dropbox", "GoogleDrive", "Instagram"]}
        proudlyDisplayPoweredByUppy={false}
        locale={{
          strings: {
            // Text to show on the droppable area.
            // `%{browse}` is replaced with a link that opens the system file selection dialog.
            dropHereOr: 'Drop here or %{browse}',
            // Used as the label for the link that opens the system file selection dialog.
            browse: 'browse'
          }
        }}
      />}
    </>;
  }
}), {
  open: observable
});
