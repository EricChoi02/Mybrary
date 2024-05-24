FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginFileEncode,
    FilePondPluginImageResize
)


FilePond.setOptions({
    stylePanelAspectRatio: 150 / 100,
    ImageResizeTargetWidth: 100,
    ImageResizeTargetHeight: 150
})

FilePond.parse(document.body);