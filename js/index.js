// Cria um color buffer para armazenar a imagem final.
let color_buffer = new Canvas("canvas");
color_buffer.clear();

/******************************************************************************
 * Vértices do modelo (cubo) centralizado no seu espaco do objeto. Os dois
 * vértices extremos do cubo são (-1,-1,-1) e (1,1,1), logo, cada aresta do cubo
 * tem comprimento igual a 2.
 *****************************************************************************/
//                                   X     Y     Z    W (coord. homogênea)
// let vertices = [new THREE.Vector4(-1.0, -1.0, -1.0, 1.0),
// new THREE.Vector4(1.0, -1.0, -1.0, 1.0),
// new THREE.Vector4(1.0, -1.0, 1.0, 1.0),
// new THREE.Vector4(-1.0, -1.0, 1.0, 1.0),
// new THREE.Vector4(-1.0, 1.0, -1.0, 1.0),
// new THREE.Vector4(1.0, 1.0, -1.0, 1.0),
// new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
// new THREE.Vector4(-1.0, 1.0, 1.0, 1.0)];
let vertices = [new THREE.Vector4(-1.0, -1.0, -1.0, 1.0),
    new THREE.Vector4(1.0, -1.0, -1.0, 1.0),
    new THREE.Vector4(1.0, 1.0, -1.0, 1.0),
    new THREE.Vector4(-1.0, 1.0, -1.0, 1.0),
    new THREE.Vector4(0.0, 0.0, 1.0, 1.0),
    new THREE.Vector4(0.0, 0.0, 1.0, 1.0),
    new THREE.Vector4(0.0, 0.0, 1.0, 1.0),
    new THREE.Vector4(0.0, 0.0, 1.0, 1.0),];

/******************************************************************************
 * As 12 arestas do cubo, indicadas através dos índices dos seus vértices.
 *****************************************************************************/
// let edges = [[0, 1],
// [1, 2],
// [2, 3],
// [3, 0],
// [4, 5],
// [5, 6],
// [6, 7],
// [7, 4],
// [0, 4],
// [1, 5],
// [2, 6],
// [3, 7]];

let edges = [[0,1],
			 [1,2],
			 [2,3],
			 [3,0],
			 [0,4],
			 [1,5],
			 [2,6],
			 [3,7]];

/******************************************************************************
 * Matriz Model (modelagem): Esp. Objeto --> Esp. Universo. 
 * OBS: A matriz está carregada inicialmente com a identidade.
 *****************************************************************************/
let m_model = new ModelMatrix();

m_model.apply_transformations(['rotation', 'rotation'], [{ axis: 'x', theta: 240 }, { axis: 'y', theta: -20 }]);

for (let i = 0; i < 8; ++i)
    vertices[i].applyMatrix4(m_model);

/******************************************************************************
 * Parâmetros da camera sintética.
 *****************************************************************************/
let cam_pos = new THREE.Vector3(1.3, 1.7, 2.0);     // posição da câmera no esp. do Universo.
let cam_look_at = new THREE.Vector3(0.0, 0.0, 0.0); // ponto para o qual a câmera aponta.
let cam_up = new THREE.Vector3(0.0, 1.0, 0.0);      // vetor Up da câmera.

/******************************************************************************
 * Matriz View (visualização): Esp. Universo --> Esp. Câmera
 * OBS: A matriz está carregada inicialmente com a identidade. 
 *****************************************************************************/

// Derivar os vetores da base da câmera a partir dos parâmetros informados acima.

const direction_vector = new THREE.Vector3();
let z_cam = new THREE.Vector3();
let x_cam = new THREE.Vector3();
let y_cam = new THREE.Vector3();

direction_vector.subVectors(cam_look_at, cam_pos);
z_cam = direction_vector.normalize().clone().negate();
x_cam.crossVectors(cam_up, z_cam).normalize();
y_cam.crossVectors(z_cam, x_cam).normalize();

// Construir 'm_bt', a inversa da matriz de base da câmera.

let m_bt = new ModelMatrix();

m_bt.set(x_cam.x, x_cam.y, x_cam.z, 0.0,
    y_cam.x, y_cam.y, y_cam.z, 0.0,
    z_cam.x, z_cam.y, z_cam.z, 0.0,
    0.0, 0.0, 0.0, 1.0);

// Construir a matriz 'm_t' de translação para tratar os casos em que as
// origens do espaço do universo e da câmera não coincidem.

let m_t = new ModelMatrix();

m_t.apply_transformations(['translation'], [{ t_x: -cam_pos.x, t_y: -cam_pos.y, t_z: -cam_pos.z }]);
// Constrói a matriz de visualização 'm_view' como o produto
//  de 'm_bt' e 'm_t'.
let m_view = m_bt.clone().multiply(m_t);

for (let i = 0; i < 8; ++i)
    vertices[i].applyMatrix4(m_view);

/******************************************************************************
 * Matriz de Projecao: Esp. Câmera --> Esp. Recorte
 * OBS: A matriz está carregada inicialmente com a identidade. 
 *****************************************************************************/

const d_parameter = 1;
let m_projection = new THREE.Matrix4();

m_projection.set(1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, d_parameter,
    0.0, 0.0, (-1.0 / d_parameter), 0.0);

for (let i = 0; i < 8; ++i)
    vertices[i].applyMatrix4(m_projection);

/******************************************************************************
 * Homogeneizacao (divisao por W): Esp. Recorte --> Esp. Canônico
 *****************************************************************************/

for (let i = 0; i < 8; ++i)
    vertices[i].divideScalar(vertices[i].w);

/******************************************************************************
 * Matriz Viewport: Esp. Canônico --> Esp. Tela
 * OBS: A matriz está carregada inicialmente com a identidade. 
 *****************************************************************************/

let m_viewport = new ModelMatrix();
const viewport_transformations = ['scale', 'translation'];
const viewport_scale = {
    s_x: 128/2,
    s_y: 128/2,
    s_z: 1
};
const viewport_translation = {
    t_x: 1,
    t_y: 1,
    t_z: 0
};

m_viewport.apply_transformations(viewport_transformations, [viewport_scale, viewport_translation]);

for (let i = 0; i < 8; ++i)
    vertices[i].applyMatrix4(m_viewport);

/******************************************************************************
 * Rasterização
 *****************************************************************************/
color = [255, 0, 0, 0];
for (let i = 0; i < edges.length; ++i) {
    MidPointLineAlgorithm(vertices[edges[i][0]].x, vertices[edges[i][0]].y, vertices[edges[i][1]].x, vertices[edges[i][1]].y, color, color);
}