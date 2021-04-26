class ModelMatrix extends THREE.Matrix4 {
    constructor() {
        super();
        this.set(1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0);
    }

    transformations = {
        'scale': this.scale_matrix,
        'rotation': this.rotation_matrix,
        'shear': this.shear_matrix,
        'translation': this.translation_matrix
    };

    /*  Função que recebe as transformações contidas na matriz de modelagem
        ex: 
          //chamada para dobrar o tamanho do objeto e rotacioná-lo 45 graus no eixo x
          applyTransformations(['scale', 'rotation'], [{s_x: 2, s_y: 2, s_z: 1}, {axis: 'x', theta: 45}])
        Aplica as transformações à matriz de modelagem.
                         array de string,      array de objetos */
    apply_transformations(transformations = [], args = []) {
        const result_matrix = new THREE.Matrix4();
        result_matrix.set(1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0);

        for (let i = 0; i < transformations.length; i++) {
            result_matrix.multiply(this.transformations[transformations[i]](args[i]));
        }

        this.multiply(result_matrix);
    }

    scale_matrix(args) {
        let s_x = args.s_x;
        let s_y = args.s_y;
        let s_z = args.s_z;

        let m_scale = new THREE.Matrix4();

        m_scale.set(s_x, 0.0, 0.0, 0.0,
            0.0, s_y, 0.0, 0.0,
            0.0, 0.0, s_z, 0.0,
            0.0, 0.0, 0.0, 1.0);

        return m_scale;
    }

    shear_matrix(args) {
        let d_x = args.d_x;
        let d_y = args.d_y;
        let d_z = args.d_z;

        let m_shear = new THREE.Matrix4();

        m_shear.set(1.0, d_y, d_z, 0.0,
            d_x, 1.0, d_z, 0.0,
            d_x, d_y, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0);

        return m_shear;
    }

    rotation_matrix(args) {
        let axis = args.axis;
        let theta = args.theta;

        // graus para radianos
        theta *= Math.PI / 180.0;
        theta_cosine = Math.cos(theta);
        theta_sine = Math.sin(theta);

        if (axis === 'x') {
            const m_x_rotation = new THREE.Matrix4();
            m_x_rotation.set(1.0, 0.0, 0.0, 0.0,
                0.0, theta_cosine, -theta_sine, 0.0,
                0.0, theta_sine, theta_cosine, 0.0,
                0.0, 0.0, 0.0, 1.0);

            return m_x_rotation;
        }
        else if (axis === 'y') {
            const m_y_rotation = new THREE.Matrix4();
            m_y_rotation.set(theta_cosine, 0.0, theta_sine, 0.0,
                0.0, 1.0, 0.0, 0.0,
                -theta_sine, 0.0, theta_cosine, 0.0,
                0.0, 0.0, 0.0, 1.0);

            return m_y_rotation;
        }
        else {
            const m_z_rotation = new THREE.Matrix4();
            m_z_rotation.set(theta_cosine, -theta_sine, 0.0, 0.0,
                theta_sine, theta_cosine, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0);

            return m_z_rotation;
        }
    }

    translation_matrix(args) {
        let t_x = args.t_x;
        let t_y = args.t_y;
        let t_z = args.t_z;

        let m_translation = new THREE.Matrix4();

        m_translation.set(1.0, 0.0, 0.0, t_x,
            0.0, 1.0, 0.0, t_y,
            0.0, 0.0, 1.0, t_z,
            0.0, 0.0, 0.0, 1.0);

        return m_translation;
    }

}