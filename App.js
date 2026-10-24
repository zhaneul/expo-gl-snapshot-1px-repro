import { useRef, useState } from 'react';
import { Button, PixelRatio, StyleSheet, Text, View } from 'react-native';
import { GLView } from 'expo-gl';

export default function App() {
  const glRef = useRef(null);
  const [status, setStatus] = useState('Waiting for GL context');

  function onContextCreate(gl) {
    gl.clearColor(1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.endFrameEXP();
    glRef.current = gl;
    setStatus('Ready');
  }

  async function snapshot(size) {
    setStatus(`Taking a ${size}x${size} snapshot...`);
    try {
      const result = await GLView.takeSnapshotAsync(glRef.current, {
        rect: { x: 0, y: 0, width: size, height: size },
      });
      setStatus(`${size}x${size}: ${result.width}x${result.height} ${result.uri}`);
    } catch (e) {
      setStatus(`${size}x${size} rejected: ${e.message}`);
    }
  }

  return (
    <View style={styles.container}>
      <GLView style={styles.gl} onContextCreate={onContextCreate} />
      <Text>PixelRatio: {PixelRatio.get()}</Text>
      <Button title="Snapshot 4x4" onPress={() => snapshot(4)} />
      <Button title="Snapshot 1x1" onPress={() => snapshot(1)} />
      <Text selectable style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  gl: { width: 100, height: 100 },
  status: { textAlign: 'center' },
});
