Atividade 2 - Pipeline Gráfico
====

#### José Felipe Nunes da Silva - 20170019610
#### Rebeca Raab Bias Ramos - 20170070453

O pipeline gráfico é um modelo conceitual que descreve quais passos o sistema gráfico precisa para renderizar uma cena 3D em uma tela 2D. Dessa forma, consiste numa sequência de transformações que levam os pontos do espaço do objeto (onde o objeto é modelado matematicamente) ao espaço da tela (onde o objeto é exibido depois de aplicadas as devidas transformações, através de um algoritmo de rasterização de linhas). Estas transformações são realizadas através de operações geométricas, envolvendo vetores e matrizes, representados em espaços de 3 dimensões, listados na imagem a seguir.

<img src="https://i.imgur.com/RWKOpBk.png" alt="pipeline" />

Para resolução da atividade que consistia em implementar os estágios geométricos encontrados tipicamente em um pipeline gráfico por meio de transformações geometricas descritas
na forma de matrizes e considerando o espaço homogêneo (i.e. matrizes 4×4). Foram implementadas as técnicas sugeridas pelo professor e encontradas no livro **Fundamentals of computer graphics 4th Ed** para a realização desta tarefa. 

## Matriz de modelagem
Contém todas as transformações necessárias para levarem a geometria do espaço do objeto para o espaço do universo. Para transportar vetores do espaço do objeto para o espaço do universo, precisa utilizar transformações geométricas como: Rotação, Translação, Cisalhamento ou Shear e Scale sobre cada vetor a uma **Matriz Model = I(identidade)**.

<img src="https://i.imgur.com/Qnd294s.png" alt="pipeline"/>

Para representar a matriz de modelagem, foi implementada uma classe ```ModelMatrix``` herdando da classe ```Matrix4``` da biblioteca Trhee.js. Esta classe herda todos os atributos de sua classe pai acrescentando a estes um dicionário contendo as transformações possíveis de se realizar. Os métodos implementados nesta classe são as transformações que o um objeto pode sofer ao logo da transição de espaços e o principal deles, onde as transformações são combinadas e aplicadas à matriz. O diagrama para esta classe é apresentado na figura a seguir.

<img src="https://imgur.com/ZLSRsgp.png" alt="pipeline"/>

A implementação da classe vai ser discutida a seguir.

#### Transformações

Cada método da classe retorna uma matriz contendo as informações da transformação que deve ser aplicada ao objeto. Um dicionário para facilitar o acesso a estes métodos foi implementado como a seguir.

```js
transformations = {
    'scale': this.scale_matrix,
    'rotation': this.rotation_matrix,
    'shear': this.shear_matrix,
    'translation': this.translation_matrix
};
```

#### Aplicação das transformações 

Para que as transformações sejam aplicadas à matriz basta que seja chamado o método ```apply_transformations``` passando como parâmetro um array de ```string``` contendo os nomes das transformações a serem aplicadas (ex: ```['scale', 'rotation']```) além de um array de objetos contendo os argumentos para cada transformação na mesma ordem que o primeiro (ex: ```[{s_x: 2, s_y: 2, s_z: 2}, {axis: 'x', theta: 45}]```), então os arrays são percorridos e o dicionário de transformações é acessado realizando a chamada dos respectivos métodos, passando seus argumentos, as matrizes retornadas são multiplicadas e por fim a matriz de modelagem é atualizada com a matriz resultante. A implementação desta função é apresentada a seguir.

```js
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
```

#### Matriz de escala

Esta matriz é responsável por realizar transformações geométricas de forma que as dimensões do objeto sejam alteradas, aumentando ou diminuindo seu tamanho. A implementação do método que representa este tipo de transformação é mostrado a seguir.

```js
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
```

O método acima tem como parâmetro um objeto contendo os atributos numéricos ```s_x, s_y, s_z```, representando quanto as dimensões do objeto devem ser alteradas em cada eixo do espaço em que este se encontra (ex: ```{s_x: 2, s_y: 2, s_z: 2}```).

#### Matriz de cisalhamento

Esta matriz é responsável por realizar transformações geométricas de forma que possibilita a distorção da representação do objeto em algum eixo. A implementação do método que representa esta transformação é mostrada a sguir.

```js
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
```

O método acima tem como parâmetro um objeto contendo os atributos numéricos ```d_x, d_y, d_z```, representando o grau de distorção do objeto em cada eixo do espaço em que este se encontra (ex: ```{d_x: 2, d_y: 2, d_z: 2}```).

#### Matriz de rotação

Esta matriz é responsável por realizar transformações geométricas de forma que possibilita que o objeto seja rotacionado ao redor de algum eixo. A implementação do método que representa esta transformação é mostrada a sguir.

```js
rotation_matrix(args) {
    let axis = args.axis;
    let theta = args.theta;

    // graus para radianos
    theta *= Math.PI / 180.0;

    const m_x_rotation = new THREE.Matrix4();
    m_x_rotation.set(1.0, 0.0, 0.0, 0.0,
        0.0, Math.cos(theta), -Math.sin(theta), 0.0,
        0.0, Math.sin(theta), Math.cos(theta), 0.0,
        0.0, 0.0, 0.0, 1.0);

    const m_y_rotation = new THREE.Matrix4();
    m_y_rotation.set(Math.cos(theta), 0.0, Math.sin(theta), 0.0,
        0.0, 1.0, 0.0, 0.0,
        -Math.sin(theta), 0.0, Math.cos(theta), 0.0,
        0.0, 0.0, 0.0, 1.0);

    const m_z_rotation = new THREE.Matrix4();
    m_z_rotation.set(Math.cos(theta), -Math.sin(theta), 0.0, 0.0,
        Math.sin(theta), Math.cos(theta), 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0);

    const m_rotation = { 'x': m_x_rotation, 'y': m_y_rotation, 'z': m_z_rotation };

    return m_rotation[axis];
}
```

O método acima tem como parâmetro um objeto contendo os atributos ```axis, theta```, sendo o primeiro uma string podendo ser 'x', 'y' ou 'z' e o segundo o ângulo da rotação realizada em graus. Um exemplo de argumentos para a chamada desse método pode ser: ```{axis: 'y', theta: 45}``` para rotacionar o objeto 45 graus ao redor do eixo y.

#### Matriz de translação

Esta matriz é responsável por realizar transformações geométricas de forma que o objeto seja deslocado para outro ponto do espaço. A implementação do método que representa esta transformação é mostrada a sguir.

```js
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
```

O método acima tem como parâmetro um objeto contendo os atributos numéricos ```t_x, t_y, t_z```, representando o quanto o objeto deve se deslocar em cada eixo do espaço em que este se encontra (ex: ```{t_x: 2, t_y: 2, t_z: 2}```).

## Matriz View
A matriz View será responsável pelas transformações do espaço do universo para o espaço da câmera. Para isso é preciso definir três informações importantes a respeito da camera sintética que são: Posição da câmera no espaço do universo, Direção que é ponto para o qual a câmera aponta, e o vetor Up da câmera.

Sabendo que inicialmente a matriz contém a matriz identidade, o primeiro passo é derivar os vetores da base da câmera a partir dos parâmetros citados.

Como sabemos que para passar do espaço do universo para o espaço da câmera é uma mudança de base com origem diferente, assumimos que $\overrightarrow{D} = \overrightarrow{a'} = \overrightarrow{a} - \overrightarrow{t}$, onde $\overrightarrow{t}$ é a posição da câmera no espaço do universo e $\overrightarrow{a}$ o ponto no espaço do universo para onde a câmera está apontando.

Dessa forma, a base ortonormal da câmera pode ser calculada pelos vetores, Xcam, Ycam e Zcam. Onde:

$Xcam = \frac{U \times Zcam}{|U \times Zcam|}$
$Ycam = \frac{Zcam \times Xcam}{|Zcam \times Xcam|}$
$Zcam = \frac{-D}{|D|}$

Como se trata de uma base ortonormal estes vetores precisam ser normalizados.

O segundo passo é construir a inversa da matriz de base da câmera $Mbase = B^{T} \times T$, onde $B^{T}$ é a matriz transposta e T é a matriz de translação.

E por fim, construir a matriz de visualização que vai ser: $Mview = B^{T}} \times T$.

<img src="https://imgur.com/H7frrGc.png" alt="pipeline"/>

Na implementação do pipeline, para derivar os vetores da base da câmera foram realizados comandos utilizando métodos de opeções geométricas da biblioteca Three.js. Os cálculos realizados são mostrados a seguir.

```js
let cam_pos = new THREE.Vector3(1.3, 1.7, 2.0);     // posição da câmera no esp. do Universo.
let cam_look_at = new THREE.Vector3(0.0, 0.0, 0.0); // ponto para o qual a câmera aponta.
let cam_up = new THREE.Vector3(0.0, 1.0, 0.0);      // vetor Up da câmera.

const direction_vector = new THREE.Vector3();
let z_cam = new THREE.Vector3();
let x_cam = new THREE.Vector3();
let y_cam = new THREE.Vector3();

direction_vector.subVectors(cam_look_at, cam_pos);
z_cam = direction_vector.normalize().clone().negate();
x_cam.crossVectors(cam_up, z_cam).normalize();
y_cam.crossVectors(z_cam, x_cam).normalize();
```

Em seguida é obtida a inversa da matriz da base da câmera, em seguida é aplicada uma translação a ela, através da sequência de comandos a seguir.

```js
let m_bt = new ModelMatrix();

m_bt.set(x_cam.x, x_cam.y, x_cam.z, 0.0,
    y_cam.x, y_cam.y, y_cam.z, 0.0,
    z_cam.x, z_cam.y, z_cam.z, 0.0,
    0.0, 0.0, 0.0, 1.0);

let m_t = new ModelMatrix();

m_t.apply_transformations(['translation'], [{ t_x: -cam_pos.x, t_y: -cam_pos.y, t_z: -cam_pos.z }]);

let m_view = m_bt.clone().multiply(m_t);
```

## Matriz de projeção
É responsável por levar objetos do espaço da câmera para o espaço de recorte. Para isso devemos levar em conta o parâmetro **d**, que é a distância do centro de captura para o eixo y, ao longo do eixo z. E a matriz de Projeção corrigida que é: $Mp_{corrigida}= Mp \times Mt$, onde Mt é a matriz de translação no eixo z, dessa forma aproximamos a cena do centro de projeção ao longo do eixo z. E Mp é a matriz de projeção que leva um ponto do espaço da câmera para o espaço de recorte.

Logo $Mp_{corrigida}$ pega os vertices no espaço da câmera e aplica a distorção perspectiva com distâncias corretas.

<img src="https://i.imgur.com/fyi4sET.png" alt="pipeline"/>

## Matriz Viewport

É responsável por levar do espaço canônico para o espaço da tela.

<img src="https://imgur.com/a6vEeq4.png" alt="pipeline"/>