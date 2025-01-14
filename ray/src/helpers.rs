pub fn create_sample_textures(
    device: &wgpu::Device,
    width: u32,
    height: u32,
) -> [wgpu::Texture; 2] {
    let desc = wgpu::TextureDescriptor {
        label: Some("Radiance Samples"),
        size: wgpu::Extent3d {
            width,
            height,
            depth_or_array_layers: 1,
        },
        mip_level_count: 1,
        sample_count: 1,
        dimension: wgpu::TextureDimension::D2,
        format: wgpu::TextureFormat::Rgba32Float,
        usage: wgpu::TextureUsages::TEXTURE_BINDING | wgpu::TextureUsages::STORAGE_BINDING,
        view_formats: &[],
    };
    // Create two textures with the same parameters.
    [device.create_texture(&desc), device.create_texture(&desc)]
}

pub fn create_display_bind_groups(
    device: &wgpu::Device,
    layout: &wgpu::BindGroupLayout,
    textures: &[wgpu::Texture; 2],
    uniforms_buffer: &wgpu::Buffer,
) -> [wgpu::BindGroup; 2] {
    let views = [
        textures[0].create_view(&wgpu::TextureViewDescriptor::default()),
        textures[1].create_view(&wgpu::TextureViewDescriptor::default()),
    ];
    [
        // Bind group with view[0] assigned to binding 1 and view[1] assigned to binding 2.
        device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: None,
            layout,
            entries: &[
                wgpu::BindGroupEntry {
                    binding: 0,
                    resource: wgpu::BindingResource::Buffer(wgpu::BufferBinding {
                        buffer: uniforms_buffer,
                        offset: 0,
                        size: None,
                    }),
                },
                wgpu::BindGroupEntry {
                    binding: 1,
                    resource: wgpu::BindingResource::TextureView(&views[0]),
                },
                wgpu::BindGroupEntry {
                    binding: 2,
                    resource: wgpu::BindingResource::TextureView(&views[1]),
                },
            ],
        }),
        // Bind group with view[1] assigned to binding 1 and view[0] assigned to binding 2.
        device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: None,
            layout,
            entries: &[
                wgpu::BindGroupEntry {
                    binding: 0,
                    resource: wgpu::BindingResource::Buffer(wgpu::BufferBinding {
                        buffer: uniforms_buffer,
                        offset: 0,
                        size: None,
                    }),
                },
                wgpu::BindGroupEntry {
                    binding: 1,
                    resource: wgpu::BindingResource::TextureView(&views[1]),
                },
                wgpu::BindGroupEntry {
                    binding: 2,
                    resource: wgpu::BindingResource::TextureView(&views[0]),
                },
            ],
        }),
    ]
}
