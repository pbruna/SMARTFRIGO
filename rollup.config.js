import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify      from 'rollup-plugin-uglify'
 
export default {
  entry: 'app/main.js',
  dest: 'publish/SMARTFRIGO/app/main.js',
  format: 'iife',
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true
    }),
 
    commonjs({include: 'node_modules/rxjs/**'}),
    uglify()
  ]
};