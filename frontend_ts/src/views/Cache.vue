<template>
<div>
    <h3>Files</h3>
    <div v-if="loading">
        LOADING...
    </div>
    <div v-else>
        <button value="Clear" @click="clearFiles">Clear</button>&nbsp;
        <button value="Refresh" @click="listFiles">Refresh</button>
        <br><br>
        <table border="1px solid">
            <tr height=20px>
                <td width=300px><b>Name</b></td>
                <td width=100px><b>Size</b></td>
                <td width=700px><b>Last modified</b></td>
                <td width=700px><b>Data</b></td>
                <td><b>Operations</b></td>
            </tr>
            <tr height=20px v-for="file in files" :key="file.name">
                <td>{{ file.name }}</td>
                <td>{{ file.size }}</td>
                <td>{{ file.lastModifiedDate }}</td>
                <td>{{ file.data }}</td>
                <td>
                    <button value="Delete" @click="removeFile(file.name)">Delete</button>
                </td>
            </tr>
        </table>        
    </div>    
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class Cache extends Vue {

    private files: any = [];
    private loading = false;

    private async listFiles() {
        this.loading = true;
        this.files = [];
        const opfsRoot = await navigator.storage.getDirectory();
        const entries = await opfsRoot.values();
        for await (const entry of entries) {
            const fileHandle = await opfsRoot.getFileHandle(entry.name, {create: false});
            const file = await fileHandle.getFile();
            const text = await file.text();
            const row = {'name': file.name, 'size': file.size, 'data': text.substring(0, 200), 'lastModifiedDate': file.lastModifiedDate};
            this.files.push(row);
        }
        this.loading = false;
    }

    private async clearFiles() {
        this.loading = true;
        const opfsRoot = await navigator.storage.getDirectory();
        const entries = await opfsRoot.values();
        for await (const entry of entries) {
            const fileHandle = await opfsRoot.getFileHandle(entry.name, {create: false});
            await fileHandle.remove();
        }
        this.loading = false;
        this.listFiles();
    }

    private async removeFile(filename) {
        this.loading = true;
        const opfsRoot = await navigator.storage.getDirectory();
        const fileHandle = await opfsRoot.getFileHandle(filename, {create: false});
        await fileHandle.remove();
        this.loading = false;
        this.listFiles();
    }

    mounted() {
        this.listFiles();
    }

}
</script>